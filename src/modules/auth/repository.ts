import { Repository } from "typeorm";
import { User } from "../../database/entities/user.entity";
import { OpenDataSource } from "../../database/data-source";

export class AuthRepository {
  private readonly users: Repository<User>;

  constructor() {
    this.users = OpenDataSource.getRepository(User);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  findById(id: string, withRoles = false): Promise<User | null> {
    return this.users.findOne({
      where: { id },
      relations: withRoles ? ["roles", "roles.permissions"] : undefined,
    });
  }

  async findByEmailOrNip(email: string, nip: string): Promise<User | null> {
    return this.users.findOne({
      where: [{ email }, { nip }],
      select: ["id"],
    });
  }

  create(data: Partial<User>): User {
    return this.users.create(data);
  }

  save(user: User): Promise<User> {
    return this.users.save(user);
  }

  async consumeEmailVerificationToken(tokenHash: string): Promise<boolean> {
    const result = await this.users
      .createQueryBuilder()
      .update(User)
      .set({
        isEmailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      })
      .where(
        `"email_verification_token_hash" = :tokenHash
          AND "email_verification_expires_at" > CURRENT_TIMESTAMP`,
        { tokenHash },
      )
      .execute();
    return result.affected === 1;
  }

  async consumePasswordResetToken(
    tokenHash: string,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await this.users
      .createQueryBuilder()
      .update(User)
      .set({
        password: passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      })
      .where(
        `"password_reset_token_hash" = :tokenHash
          AND "password_reset_expires_at" > CURRENT_TIMESTAMP`,
        { tokenHash },
      )
      .execute();
    return result.affected === 1;
  }

  async rotateRefreshToken(
    userId: string,
    currentTokenHash: string,
    nextTokenHash: string,
    nextTokenExpiresAt: Date,
  ): Promise<boolean> {
    const result = await this.users
      .createQueryBuilder()
      .update(User)
      .set({
        refreshTokenHash: nextTokenHash,
        refreshTokenExpiresAt: nextTokenExpiresAt,
      })
      .where(
        `"id" = :userId
          AND "refresh_token_hash" = :currentTokenHash
          AND "refresh_token_expires_at" > CURRENT_TIMESTAMP
          AND "is_active" = TRUE
          AND "is_email_verified" = TRUE`,
        { userId, currentTokenHash },
      )
      .execute();
    return result.affected === 1;
  }
}