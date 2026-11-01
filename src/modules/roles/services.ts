import { Role } from "../../database/entities/role.entity";
import { RolePermission } from "../../database/entities/rolePermission.entity";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";
import { In_ENTITY_Role } from "../../interfaces/entity.interface";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/utils/error.util";
import { In_DTO_Assignment, In_DTO_RoleListQuery } from "./dto";
import { repository } from "./repository";
import i18next from "i18next";

export class RoleService {
  public async store(payload: Partial<In_ENTITY_Role>): Promise<Role> {
    if (await repository.findByName(payload.name as string)) {
      throw new AppError(
        i18next.t("error.default.exists", { m: "Nama role" }),
        HTTP_STATUS.CONFLICT,
      );
    }

    return repository.create(payload);
  }

  public async findById(id: string): Promise<Role> {
    const role = await repository.findById(id);
    if (!role) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Role" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return role;
  }

  public async update(
    id: string,
    payload: Partial<In_ENTITY_Role>,
  ): Promise<Role> {
    const result = await this.findById(id);
    const updated = await repository.update(result.id, payload);

    if (!updated) {
      throw new AppError(
        i18next.t("error.default.updated", { m: "Role" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return updated;
  }

  public async delete(
    id: string,
    payload: Partial<In_ENTITY_Role>,
  ): Promise<any> {
    const result = await this.findById(id);
    const deleted = await repository.update(result.id, payload);

    if (!deleted) {
      throw new AppError(
        i18next.t("error.default.deleted", { m: "Role" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return deleted;
  }

  public async fetchPagination(
    query: In_DTO_RoleListQuery,
  ): Promise<In_RESULT_Pagination> {
    return await repository.fetchPagination(query);
  }

  public async assignPermission(
    payload: In_DTO_Assignment,
    baseAudit: Partial<RolePermission>,
  ): Promise<RolePermission[]> {
    const role = await this.findById(payload.role_id);
    const uniquePermissionIds = [...new Set(payload.permissions_ids)];
    const permissions =
      await repository.findPermissionsByIds(uniquePermissionIds);

    if (permissions.length !== uniquePermissionIds.length) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Permission" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return repository.assignPermission(role.id, uniquePermissionIds, baseAudit);
  }
}

export const service = new RoleService();
