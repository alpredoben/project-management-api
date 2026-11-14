import { createHash, randomBytes } from "crypto";
import { In_AUTH_JwtPayload } from "../../interfaces/auth.interface";
import { config } from "../../config";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/utils/error.util";
import { PasswordUtil } from "../../shared/utils/password.util";
import { JwtService } from "../../pkg/jwt";
import {
  MailService,
  mailService,
} from "../../pkg/smtp";
import { User } from "../../database/entities/user.entity";
import {
  AuthTokenResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./dto";
import { AuthRepository } from "./repository";
import { SmtpMailPublisher } from "../../events/publisher/smtp-mail.publisher";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const createToken = (): string => randomBytes(32).toString("hex");

const unauthorized = (): AppError =>
  new AppError("Email, kata sandi, atau token tidak valid.", HTTP_STATUS.UNAUTHORIZED);

export class AuthService {
  private repository: AuthRepository;
  constructor() {
    this.repository = new AuthRepository();
  }

  async register(input: RegisterDto): Promise<void> {
    const email = input.email.trim().toLowerCase();
    const nip = input.nip.trim();
    if (await this.repository.findByEmailOrNip(email, nip)) {
      throw new AppError(
        "Email atau NIP sudah digunakan.",
        HTTP_STATUS.CONFLICT,
      );
    }

    const verificationToken = createToken();
    const user = this.repository.create({
      name: input.name.trim(),
      nip,
      email,
      password: await PasswordUtil.hashPassword(input.password),
      isActive: true,
      isEmailVerified: false,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpiresAt: new Date(
        Date.now() + EMAIL_VERIFICATION_TTL_MS,
      ),
    });

    await this.repository.save(user);

    await SmtpMailPublisher.publish({
      type: 'verify-email',
      data: {
        email: user.email,
        name: user.name,
        verificationToken
      }
    });
  }

  async verifyEmail(token: string): Promise<void> {
    if (!(await this.repository.consumeEmailVerificationToken(hashToken(token)))) {
      throw new AppError(
        "Token verifikasi tidak valid atau kedaluwarsa.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  async login(input: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.repository.findByEmail(
      input.email.trim().toLowerCase(),
    );

    console.log('Data user', user)
    if (
      !user ||
      !user.isActive ||
      !user.isEmailVerified ||
      !(await PasswordUtil.verifyPassword(input.password, user.password))
    ) {
      throw unauthorized();
    }

    user.lastLoginAt = new Date();
    return this.createTokenPair(user, input.remember_password === true);
  }

  async forgotPassword(input: ForgotPasswordDto): Promise<void> {
    const user = await this.repository.findByEmail(
      input.email.trim().toLowerCase(),
    );
    if (!user || !user.isActive) {
      return;
    }

    const resetToken = createToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await this.repository.save(user);

    await SmtpMailPublisher.publish({
      type: 'reset-password',
      data: {
        name: user.name,
        email: user.email,
        resetToken
      }
    });
  }

  async resetPassword(input: ResetPasswordDto, token: string): Promise<void> {
    const passwordHash = await PasswordUtil.hashPassword(input.new_password);
    if (
      !(await this.repository.consumePasswordResetToken(
        hashToken(token),
        passwordHash,
      ))
    ) {
      throw new AppError(
        "Token reset kata sandi tidak valid atau kedaluwarsa.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  async refreshToken(token: string): Promise<AuthTokenResponse> {
    let payload: In_AUTH_JwtPayload;
    try {
      payload = JwtService.verifyToken(token, "refresh");
    } catch {
      throw unauthorized();
    }

    const user = await this.repository.findById(payload.id);
    if (
      !user ||
      !user.isActive ||
      !user.isEmailVerified ||
      !user.refreshTokenHash ||
      user.refreshTokenHash !== hashToken(token) ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt.getTime() <= Date.now()
    ) {
      throw unauthorized();
    }

    const pair = this.generateTokenPair(user, payload.remember_me === true);
    const rotated = await this.repository.rotateRefreshToken(
      user.id,
      hashToken(token),
      hashToken(pair.tokens.refresh_token),
      pair.refreshTokenExpiresAt,
    );
    if (!rotated) {
      throw unauthorized();
    }
    return pair.tokens;
  }

  async logout(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw unauthorized();
    }
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await this.repository.save(user);
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.repository.findById(userId, true);
    if (!user || !user.isActive) {
      throw unauthorized();
    }

    const roles = (user.roles ?? []).map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      permissions: (role.permissions ?? []).map((permission) => ({
        id: permission.id,
        name: permission.name,
      })),
    }));
    const permissions = new Map(
      roles.flatMap((role) =>
        role.permissions.map((permission) => [permission.id, permission] as const),
      ),
    );

    return {
      id: user.id,
      name: user.name,
      nip: user.nip,
      email: user.email,
      avatar: user.avatarUrl,
      is_active: user.isActive,
      is_email_verified: user.isEmailVerified,
      is_login: true,
      last_login_at: user.lastLoginAt,
      roles,
      permissions: [...permissions.values()],
    };
  }

  private async createTokenPair(
    user: User,
    rememberMe: boolean,
  ): Promise<AuthTokenResponse> {
    const pair = this.generateTokenPair(user, rememberMe);
    user.refreshTokenHash = hashToken(pair.tokens.refresh_token);
    user.refreshTokenExpiresAt = pair.refreshTokenExpiresAt;
    await this.repository.save(user);
    return pair.tokens;
  }

  private generateTokenPair(
    user: User,
    rememberMe: boolean,
  ): { tokens: AuthTokenResponse; refreshTokenExpiresAt: Date } {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = JwtService.generateAccessToken(payload, rememberMe);
    const refreshToken = JwtService.generateRefreshToken(payload, rememberMe);

    return {
      tokens: {
        token_type: "Bearer",
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      refreshTokenExpiresAt: new Date(
        Date.now() +
          (rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : config.pkg.jwt.refreshTtl * 60 * 1000),
      ),
    };
  }


  
}


export const authService = new AuthService();