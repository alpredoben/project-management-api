import { In, IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Menu } from "../../database/entities/menu.entity";
import { Permission } from "../../database/entities/permission.entity";
import { Role } from "../../database/entities/role.entity";
import { RoleMenuPermission } from "../../database/entities/roleMenuPermission.entity";
import { RolePermission } from "../../database/entities/rolePermission.entity";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { escapeLike } from "../../shared/utils/sql.util";
import { In_DTO_MenuListQuery } from "./dto";

type T_Audit = Partial<Menu>;

/** Mengecek apakah `ancestor` adalah leluhur (atau sama dengan) `menu` dengan satu recursive CTE. */
const IS_ANCESTOR_SQL = `
  WITH RECURSIVE ancestors AS (
    SELECT id, parent_id FROM ${SCHEMA_NAMES.MENUS} WHERE id = $1
    UNION
    SELECT m.id, m.parent_id
      FROM ${SCHEMA_NAMES.MENUS} m
     INNER JOIN ancestors a ON m.id = a.parent_id
  )
  SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = $2) AS "found"`;

export class MenuRepository {
  private get repository(): Repository<Menu> {
    return OpenDataSource.getRepository(Menu);
  }

  public findById(id: string): Promise<Menu | null> {
    return this.repository.findOneBy({ id });
  }

  public exists(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  public create(payload: Partial<Menu>): Promise<Menu> {
    return this.repository.save(this.repository.create(payload));
  }

  /** Slug unik termasuk milik menu yang sudah di-soft-delete. */
  public isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("menu")
      .withDeleted()
      .where("menu.slug = :slug", { slug });
    return this.excluding(builder, exceptId).getExists();
  }

  /** No. urut harus unik di antara menu dengan parent yang sama (`null` = menu root). */
  public isOrderNumberTaken(
    orderNumber: number,
    parentId: string | null,
    exceptId?: string,
  ): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("menu")
      .where("menu.order_number = :orderNumber", { orderNumber })
      .andWhere("menu.parent_id IS NOT DISTINCT FROM :parentId", { parentId });
    return this.excluding(builder, exceptId).getExists();
  }

  /** `true` bila menempatkan `menuId` di bawah `parentId` akan membentuk siklus. */
  public async wouldCreateCycle(
    menuId: string,
    parentId: string,
  ): Promise<boolean> {
    const [{ found }] = await OpenDataSource.query<[{ found: boolean }]>(
      IS_ANCESTOR_SQL,
      [parentId, menuId],
    );
    return found;
  }

  /** Update menu aktif dan langsung mengembalikan barisnya (satu query). */
  public async update(id: string, patch: Partial<Menu>): Promise<Menu | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update()
      .set(patch)
      .where("id = :id AND deleted_at IS NULL", { id })
      .returning("*")
      .execute();
    return (raw as Menu[])[0] ?? null;
  }

  public async softDelete(id: string, patch: T_Audit): Promise<boolean> {
    const { affected } = await this.repository.update(
      { id, deleted_at: IsNull() },
      patch,
    );
    return Boolean(affected);
  }

  public roleExists(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(Role).existsBy({ id });
  }

  public countPermissionsByIds(ids: string[]): Promise<number> {
    return OpenDataSource.getRepository(Permission).countBy({ id: In(ids) });
  }

  public countRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<number> {
    return OpenDataSource.getRepository(RolePermission).countBy({
      role_id: roleId,
      permission_id: In(permissionIds),
    });
  }

  /**
   * Upsert dalam satu statement atomik (memakai unique role+menu+permission):
   * assignment baru di-insert, yang pernah di-soft-delete dipulihkan.
   */
  public async upsertRolePermissions(
    roleId: string,
    menuId: string,
    permissionIds: string[],
    audit: Partial<RoleMenuPermission>,
  ): Promise<RoleMenuPermission[]> {
    const { raw } = await OpenDataSource.createQueryBuilder()
      .insert()
      .into(RoleMenuPermission)
      .values(
        permissionIds.map((permission_id) => ({
          role_id: roleId,
          menu_id: menuId,
          permission_id,
          ...audit,
          deleted_at: null,
          deleted_by: null,
        })),
      )
      .orUpdate(
        ["deleted_at", "deleted_by", "updated_at", "updated_by"],
        ["role_id", "menu_id", "permission_id"],
      )
      .returning("*")
      .execute();
    return raw as RoleMenuPermission[];
  }

  /** Daftar menu + total: 2 query paralel. */
  public async fetchPagination(query: In_DTO_MenuListQuery) {
    const { page, limit, sort_by, order_by, search } = query;
    const [data, totalItems] = await Promise.all([
      this.applySearch(this.repository.createQueryBuilder("menu"), search)
        .orderBy(`menu.${sort_by}`, order_by)
        .addOrderBy("menu.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getMany(),
      this.applySearch(
        this.repository.createQueryBuilder("menu"),
        search,
      ).getCount(),
    ]);
    return toPaginationResult(data, page, limit, totalItems);
  }

  private excluding(
    builder: SelectQueryBuilder<Menu>,
    exceptId?: string,
  ): SelectQueryBuilder<Menu> {
    return exceptId
      ? builder.andWhere("menu.id <> :exceptId", { exceptId })
      : builder;
  }

  private applySearch(
    builder: SelectQueryBuilder<Menu>,
    search: string,
  ): SelectQueryBuilder<Menu> {
    return search
      ? builder.andWhere(
          "(menu.name ILIKE :search OR menu.slug ILIKE :search OR menu.path ILIKE :search)",
          { search: `%${escapeLike(search)}%` },
        )
      : builder;
  }
}

export const repository = new MenuRepository();
