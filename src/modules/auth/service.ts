import { createHash, timingSafeEqual } from "crypto";
import { User } from "../../database/entities/user.entity";
import {
  In_AUTH_RefreshTokenResponse,
  In_AUTH_SignInResponse,
  In_AUTH_UserProfile,
} from "../../interfaces/auth.interface";
import { JwtService } from "../../pkg/jwt";
import { AppError } from "../../shared/utils/error.util";
import { PasswordUtil } from "../../shared/utils/password.util";
import i18next from "../../lang/translation";
import { HTTP_STATUS } from "../../shared/constants";
import { repository } from "./repository";

const unauthorized = (
  messageKey = "error.auth.invalid_credentials",
  defaultMessage = "Email atau password yang Anda masukkan salah.",
): AppError =>
  new AppError(
    i18next.t(messageKey, { defaultValue: defaultMessage }),
    HTTP_STATUS.UNAUTHORIZED,
  );

const profileFor = (
  user: User,
  roles: In_AUTH_UserProfile["roles"],
  roleMenuPermissions: In_AUTH_UserProfile["role_menu_permissions"],
): In_AUTH_UserProfile => ({
  id: user.id,
  name: user.name ?? null,
  email: user.email,
  phone: user.phone ?? null,
  is_active: user.is_active,
  roles,
  role_menu_permissions: roleMenuPermissions,
});

const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const matchesRefreshToken = (token: string, storedHash: string): boolean => {
  if (!/^[a-f\d]{64}$/i.test(storedHash)) {
    return false;
  }

  const tokenHash = Buffer.from(hashRefreshToken(token), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");
  return timingSafeEqual(tokenHash, expectedHash);
};

export class AuthService {
  public async login(
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<In_AUTH_SignInResponse> {
    const user = await repository.findByEmail(email.trim().toLowerCase());

    if (!user || !user.is_active) {
      throw unauthorized();
    }

    const passwordCheck: boolean = await PasswordUtil.verifyPassword(
      password,
      user.password,
    );
    if (!passwordCheck) {
      throw unauthorized();
    }

    const passwordHash = await PasswordUtil.hashPassword(password);
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = JwtService.generateAccessToken(
      tokenPayload,
      rememberMe,
    );
    const refreshToken = JwtService.generateRefreshToken(
      tokenPayload,
      rememberMe,
    );

    const updated = await repository.updateLogin(
      user.id,
      hashRefreshToken(refreshToken),
      passwordHash,
    );
    if (!updated) {
      throw unauthorized();
    }

    return {
      token_type: "Bearer",
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  public async refreshToken(
    refreshToken: string,
  ): Promise<In_AUTH_RefreshTokenResponse> {
    let payload;
    try {
      payload = JwtService.verifyToken(refreshToken, "refresh");
    } catch {
      throw unauthorized(
        "error.auth.refresh_token_invalid",
        "Token sesi tidak valid atau telah kedaluwarsa.",
      );
    }

    const user = await repository.findActiveById(payload.id);
    if (
      !user ||
      !user.refresh_token ||
      !matchesRefreshToken(refreshToken, user.refresh_token)
    ) {
      throw unauthorized(
        "error.auth.refresh_token_invalid",
        "Token sesi tidak valid atau telah kedaluwarsa.",
      );
    }

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
    };
    const accessToken = JwtService.generateAccessToken(
      tokenPayload,
      payload.remember_me,
    );
    const nextRefreshToken = JwtService.generateRefreshToken(
      tokenPayload,
      payload.remember_me,
    );
    const rotated = await repository.rotateRefreshToken(
      user.id,
      user.refresh_token,
      hashRefreshToken(nextRefreshToken),
    );

    if (!rotated) {
      throw unauthorized(
        "error.auth.refresh_token_invalid",
        "Token sesi tidak valid atau telah kedaluwarsa.",
      );
    }

    return {
      token_type: "Bearer",
      access_token: accessToken,
      refresh_token: nextRefreshToken,
    };
  }

  public async logout(userId: string): Promise<void> {
    await repository.logout(userId);
  }

  public async getProfile(userId: string): Promise<In_AUTH_UserProfile> {
    const user = await repository.findActiveById(userId);
    if (!user) {
      throw unauthorized(
        "error.default.unauthorized",
        "Akses ditolak. Token tidak valid atau kedaluwarsa.",
      );
    }

    const [roles, roleMenuPermissions] = await Promise.all([
      repository.findRoles(user.id),
      repository.findRoleMenuPermissions(user.id),
    ]);
    return profileFor(user, roles, roleMenuPermissions);
  }
}

export const service = new AuthService();
