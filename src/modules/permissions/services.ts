import { Permission } from "../../database/entities/permission.entity";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";
import { In_ENTITY_Permission } from "../../interfaces/entity.interface";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/utils/error.util";
import { In_DTO_PermissionListQuery } from "./dto";
import { repository } from "./repository";
import i18next from "i18next";

export class PermissionService {
  public async store(payload: Partial<In_ENTITY_Permission>): Promise<Permission> {
    const [existingName, existingSlug] = await Promise.all([
      repository.findByName(payload.name as string),
      repository.findBySlug(payload.slug as string),
    ]);
    if (existingName || existingSlug) {
      throw new AppError(
        i18next.t("error.default.exists", { m: "Nama permission" }),
        HTTP_STATUS.CONFLICT,
      );
    }

    return repository.create(payload);
  }

  public async findById(id: string): Promise<Permission> {
    const permission = await repository.findById(id);
    if (!permission) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Permission" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return permission;
  }

  public async update(
    id: string,
    payload: Partial<In_ENTITY_Permission>,
  ): Promise<Permission> {
    const permission = await this.findById(id);
    if (payload.name) {
      const [existingName, existingSlug] = await Promise.all([
        repository.findByName(payload.name),
        repository.findBySlug(payload.slug as string),
      ]);
      if (
        (existingName && existingName.id !== permission.id) ||
        (existingSlug && existingSlug.id !== permission.id)
      ) {
        throw new AppError(
          i18next.t("error.default.exists", { m: "Nama permission" }),
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const updated = await repository.update(permission.id, payload);
    if (!updated) {
      throw new AppError(
        i18next.t("error.default.updated", { m: "Permission" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return updated;
  }

  public async delete(
    id: string,
    payload: Partial<In_ENTITY_Permission>,
  ): Promise<boolean> {
    const permission = await this.findById(id);
    const deleted = await repository.delete(permission.id, payload);
    if (!deleted) {
      throw new AppError(
        i18next.t("error.default.deleted", { m: "Permission" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return deleted;
  }

  public async fetchPagination(
    query: In_DTO_PermissionListQuery,
  ): Promise<In_RESULT_Pagination> {
    return repository.fetchPagination(query);
  }
}

export const service = new PermissionService();