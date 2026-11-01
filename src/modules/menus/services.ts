import { Menu } from "../../database/entities/menu.entity";
import { RoleMenuPermission } from "../../database/entities/roleMenuPermission.entity";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";
import { In_ENTITY_Menu } from "../../interfaces/entity.interface";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError } from "../../shared/utils/error.util";
import { In_DTO_AddRolePermissionMenu, In_DTO_MenuListQuery } from "./dto";
import { repository } from "./repository";
import i18next from "i18next";

export class MenuService {
  public async store(payload: Partial<In_ENTITY_Menu>): Promise<Menu> {
    if (await repository.findBySlug(payload.slug as string)) {
      throw new AppError(
        i18next.t("error.default.exists", { m: "Slug menu" }),
        HTTP_STATUS.CONFLICT,
      );
    }

    await this.validateParent(payload.parent_id);

    const existOrderNumber = await repository.checkOrderNumberExists({
      order_number: Number(payload.order_number),
      parent_id: payload.parent_id,
    });

    if (existOrderNumber) {
      throw new AppError(
        i18next.t("error.default.exists", { m: "No. order/urut" }),
        HTTP_STATUS.CONFLICT,
      );
    }

    return repository.create(payload);
  }

  public async findById(id: string): Promise<Menu> {
    const menu = await repository.findById(id);
    if (!menu) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Menu" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return menu;
  }

  public async update(
    id: string,
    payload: Partial<In_ENTITY_Menu>,
  ): Promise<Menu> {
    const menu = await this.findById(id);
    if (payload.slug && payload.slug !== menu.slug) {
      const existing = await repository.findBySlug(payload.slug);
      if (existing && existing.id !== menu.id) {
        throw new AppError(
          i18next.t("error.default.exists", { m: "Slug menu" }),
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    if (payload.parent_id !== undefined) {
      if (payload.parent_id === menu.id) {
        throw new AppError(
          "Menu tidak dapat menjadi parent dirinya sendiri.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      await this.validateParent(payload.parent_id);
    }

    // Exist order number validation
    const existOrderNumber = await repository.checkOrderNumberExists({
      order_number: Number(payload.order_number),
      parent_id: payload.parent_id,
    });

    if (existOrderNumber) {
      throw new AppError(
        i18next.t("error.default.exists", { m: "No. order/urut" }),
        HTTP_STATUS.CONFLICT,
      );
    }

    const updated = await repository.update(menu.id, payload);
    if (!updated) {
      throw new AppError(
        i18next.t("error.default.updated", { m: "Menu" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return updated;
  }

  public async delete(
    id: string,
    payload: Partial<In_ENTITY_Menu>,
  ): Promise<boolean> {
    const menu = await this.findById(id);
    const deleted = await repository.delete(menu.id, payload);
    if (!deleted) {
      throw new AppError(
        i18next.t("error.default.deleted", { m: "Menu" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    return deleted;
  }

  public async fetchPagination(
    query: In_DTO_MenuListQuery,
  ): Promise<In_RESULT_Pagination> {
    return repository.fetchPagination(query);
  }

  public async addRolePermissionMenu(
    payload: In_DTO_AddRolePermissionMenu,
    audit: Partial<RoleMenuPermission>,
  ): Promise<RoleMenuPermission[]> {
    const [role, menu] = await Promise.all([
      repository.findRoleById(payload.role_id),
      repository.findById(payload.menu_id),
    ]);
    if (!role) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Role" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    if (!menu) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Menu" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const permissionIds = [...new Set(payload.permissions_ids)];
    const [permissions, assignedPermissionIds] = await Promise.all([
      repository.findPermissionIdsByIds(permissionIds),
      repository.findAssignedPermissionIds(role.id, permissionIds),
    ]);
    if (permissions.length !== permissionIds.length) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Permission" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
    if (assignedPermissionIds.length !== permissionIds.length) {
      throw new AppError(
        "Semua permission harus sudah di-assign ke role.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return repository.addRolePermissionMenu(
      role.id,
      menu.id,
      permissionIds,
      audit,
    );
  }

  private async validateParent(parentId?: string | null): Promise<void> {
    if (!parentId) {
      return;
    }
    if (!(await repository.findById(parentId))) {
      throw new AppError(
        i18next.t("error.default.not_found", { m: "Parent menu" }),
        HTTP_STATUS.NOT_FOUND,
      );
    }
  }
}

export const service = new MenuService();
