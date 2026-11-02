import { Menu } from "../../database/entities/menu.entity";
import { RoleMenuPermission } from "../../database/entities/roleMenuPermission.entity";
import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import { createSlug } from "../../shared/utils/helper";
import {
  In_DTO_AddRolePermissionMenu,
  In_DTO_CreateMenu,
  In_DTO_MenuListQuery,
  In_DTO_UpdateMenu,
} from "./dto";
import { repository } from "./repository";

type T_Audit = Partial<Menu>;

export class MenuService {
  public async store(input: In_DTO_CreateMenu, audit: T_Audit): Promise<Menu> {
    const {
      name,
      path,
      icon = null,
      parent_id = null,
      order_number = 0,
    } = input;
    const slug: string = createSlug(name);

    await Promise.all([
      this.assertSlugFree(slug),
      this.assertParentValid(parent_id),
      this.assertOrderFree(order_number, parent_id),
    ]);

    return repository.create({
      name,
      slug,
      path,
      icon,
      parent_id,
      order_number,
      ...audit,
    });
  }

  public async findById(id: string): Promise<Menu> {
    const menu = await repository.findById(id);
    if (!menu) {
      throw notFoundError("Menu");
    }
    return menu;
  }

  public async update(
    id: string,
    input: In_DTO_UpdateMenu,
    audit: T_Audit,
  ): Promise<Menu> {
    const menu = await this.findById(id);
    const slug = input.name === undefined ? undefined : createSlug(input.name);
    const parentId =
      input.parent_id === undefined
        ? (menu.parent_id ?? null)
        : input.parent_id;
    const orderNumber = input.order_number ?? menu.order_number;
    const placementChanged =
      parentId !== (menu.parent_id ?? null) ||
      orderNumber !== menu.order_number;

    await Promise.all([
      slug && slug !== menu.slug ? this.assertSlugFree(slug, id) : undefined,
      input.parent_id !== undefined
        ? this.assertParentValid(input.parent_id, id)
        : undefined,
      placementChanged
        ? this.assertOrderFree(orderNumber, parentId, id)
        : undefined,
    ]);

    const updated = await repository.update(id, {
      ...input,
      ...(slug && { slug }),
      ...audit,
    });
    if (!updated) {
      throw notFoundError("Menu");
    }
    return updated;
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError("Menu");
    }
  }

  public fetchPagination(query: In_DTO_MenuListQuery) {
    return repository.fetchPagination(query);
  }

  /** Memberi permission pada menu untuk sebuah role; permission harus sudah di-assign ke role. */
  public async addRolePermissionMenu(
    { role_id, menu_id, permissions_ids }: In_DTO_AddRolePermissionMenu,
    audit: Partial<RoleMenuPermission>,
  ): Promise<RoleMenuPermission[]> {
    const permissionIds = [...new Set(permissions_ids)];
    const [roleExists, menuExists, permissionCount, assignedCount] =
      await Promise.all([
        repository.roleExists(role_id),
        repository.exists(menu_id),
        repository.countPermissionsByIds(permissionIds),
        repository.countRolePermissions(role_id, permissionIds),
      ]);

    if (!roleExists) throw notFoundError("Role");
    if (!menuExists) throw notFoundError("Menu");
    if (permissionCount !== permissionIds.length) {
      throw notFoundError("Permission");
    }
    if (assignedCount !== permissionIds.length) {
      throw new AppError(
        "Semua permission harus sudah di-assign ke role.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return repository.upsertRolePermissions(
      role_id,
      menu_id,
      permissionIds,
      audit,
    );
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<void> {
    if (await repository.isSlugTaken(slug, exceptId)) {
      throw existsError("Slug menu");
    }
  }

  private async assertOrderFree(
    orderNumber: number,
    parentId: string | null,
    exceptId?: string,
  ): Promise<void> {
    if (await repository.isOrderNumberTaken(orderNumber, parentId, exceptId)) {
      throw existsError("No. order/urut");
    }
  }

  /** Parent harus ada dan (saat update) tidak boleh membentuk siklus. `null` = jadikan root. */
  private async assertParentValid(
    parentId: string | null,
    menuId?: string,
  ): Promise<void> {
    if (!parentId) {
      return;
    }
    const [parentExists, cyclic] = await Promise.all([
      repository.exists(parentId),
      menuId ? repository.wouldCreateCycle(menuId, parentId) : false,
    ]);
    if (!parentExists) {
      throw notFoundError("Parent menu");
    }
    if (cyclic) {
      throw new AppError(
        "Menu tidak dapat menjadi parent dirinya sendiri atau turunannya.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}

export const service = new MenuService();
