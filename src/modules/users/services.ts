import { randomUUID } from "crypto";
import i18next from "i18next";
import { minioService } from "../../pkg/minio";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/utils/error.util";
import { PasswordUtil } from "../../shared/utils/password.util";
import { detectAvatarType } from "./lib/avatar-util";
import { buildUsersWorkbook } from "./lib/excel-util";
import {
  In_DTO_CreateUser,
  In_DTO_UpdateUser,
  In_DTO_UserDetails,
  In_DTO_UserListQuery,
  In_DTO_UserListResult,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

/** Mencabut sesi aktif user (dipakai saat nonaktif, hapus, dan ganti password). */
const REVOKE_SESSION = { is_login: false, refresh_token: null } as const;

export class UserService {
  public async store(
    input: In_DTO_CreateUser,
    audit: T_Audit,
  ): Promise<In_DTO_UserDetails> {
    const { name, email, phone, password, role_ids = [] } = input;
    const [emailTaken, roleIds] = await Promise.all([
      repository.isEmailTaken(email),
      this.validateRoles(role_ids),
    ]);
    if (emailTaken) {
      throw this.emailConflict();
    }

    const id = await repository.createWithRoles(
      {
        name,
        email,
        phone,
        password: await PasswordUtil.hashPassword(password),
        is_active: true,
        ...audit,
      },
      roleIds,
      audit,
    );
    return this.fetchById(id);
  }

  public async fetchById(id: string): Promise<In_DTO_UserDetails> {
    const user = await repository.findDetailById(id);
    if (!user) {
      throw this.notFound();
    }
    return {
      ...user,
      avatar_url: user.avatar
        ? await minioService.getPresignedUrl(user.avatar)
        : null,
    };
  }

  public async update(
    id: string,
    payload: In_DTO_UpdateUser,
    audit: T_Audit,
  ): Promise<In_DTO_UserDetails> {
    if (payload.email && (await repository.isEmailTaken(payload.email, id))) {
      throw this.emailConflict();
    }
    await this.ensureFound(repository.update(id, { ...payload, ...audit }));
    return this.fetchById(id);
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    await this.ensureFound(
      repository.softDelete(id, {
        ...audit,
        is_active: false,
        ...REVOKE_SESSION,
      }),
    );
  }

  public async unactivate(id: string, audit: T_Audit): Promise<void> {
    await this.ensureFound(
      repository.update(id, { ...audit, is_active: false, ...REVOKE_SESSION }),
    );
  }

  public async changePassword(
    id: string,
    newPassword: string,
    audit: T_Audit,
  ): Promise<void> {
    const password = await PasswordUtil.hashPassword(newPassword);
    await this.ensureFound(
      repository.update(id, { ...audit, password, ...REVOKE_SESSION }),
    );
  }

  public async addUserRole(
    id: string,
    roleIds: string[],
    audit: T_Audit,
  ): Promise<In_DTO_UserDetails> {
    const [userExists, uniqueRoleIds] = await Promise.all([
      repository.exists(id),
      this.validateRoles(roleIds),
    ]);
    if (!userExists) {
      throw this.notFound();
    }
    await repository.addRoles(id, uniqueRoleIds, audit);
    return this.fetchById(id);
  }

  /**
   * File avatar disimpan di MinIO, path object-nya disimpan di `users.avatar`.
   * File lama dihapus dari MinIO setelah path baru berhasil tersimpan.
   */
  public async changeAvatar(
    id: string,
    file: Express.Multer.File | undefined,
    audit: T_Audit,
  ): Promise<In_DTO_UserDetails> {
    if (!file) {
      throw new AppError(
        "File avatar wajib diunggah.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const imageType = detectAvatarType(file.buffer);
    if (!imageType) {
      throw new AppError(
        "File harus berupa gambar JPEG, PNG, GIF, atau WEBP yang valid.",
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }
    const current = await repository.findAvatar(id);
    if (!current) {
      throw this.notFound();
    }

    const avatar = `avatars/${id}/${randomUUID()}.${imageType.extension}`;
    await minioService.uploadFile(avatar, file.buffer, file.size, {
      "Content-Type": imageType.mimeType,
    });

    try {
      await this.ensureFound(repository.update(id, { ...audit, avatar }));
    } catch (error) {
      await this.removeObject(avatar);
      throw error;
    }

    const [user] = await Promise.all([
      this.fetchById(id),
      current.avatar ? this.removeObject(current.avatar) : undefined,
    ]);
    return user;
  }

  public fetchPagination(
    query: In_DTO_UserListQuery,
  ): Promise<In_DTO_UserListResult> {
    return repository.fetchPagination(query);
  }

  public async exportXlsx(query: In_DTO_UserListQuery): Promise<Buffer> {
    return buildUsersWorkbook(await repository.exportAll(query));
  }

  /** Memastikan role ada semua; mengembalikan daftar id yang sudah unik. */
  private async validateRoles(roleIds: string[]): Promise<string[]> {
    const uniqueRoleIds = [...new Set(roleIds)];
    if (
      uniqueRoleIds.length > 0 &&
      (await repository.countRolesByIds(uniqueRoleIds)) !== uniqueRoleIds.length
    ) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Role" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return uniqueRoleIds;
  }

  private async ensureFound(operation: Promise<boolean>): Promise<void> {
    if (!(await operation)) {
      throw this.notFound();
    }
  }

  /** Hapus object MinIO secara best-effort; kegagalan sudah di-log oleh minioService. */
  private removeObject(path: string): Promise<void> {
    return minioService.deleteFile(path).catch(() => undefined);
  }

  private notFound(): AppError {
    return new AppError(
      i18next.t("error.default.not_found", { m: "User" }),
      HTTP_STATUS.NOT_FOUND,
    );
  }

  private emailConflict(): AppError {
    return new AppError(
      i18next.t("error.default.exists", { m: "Email user" }),
      HTTP_STATUS.CONFLICT,
    );
  }
}

export const service = new UserService();
