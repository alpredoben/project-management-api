import { In, Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Permission } from "../../database/entities/permission.entity";
import { RolePermission } from "../../database/entities/rolePermission.entity";
import { Role } from "../../database/entities/role.entity";
import {
  DEFAULT_SORT_COLUMN,
  In_DTO_RoleListQuery,
  T_RoleSortField,
} from "./dto";
import { PAGINATION_PROPERTIES } from "../../shared/constants";
import { generatePaginationMeta } from "../../shared/utils/pagination.util";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";

export class RoleRepository {
  private get repository(): Repository<Role> {
    return OpenDataSource.getRepository(Role);
  }

  public create(role: Partial<Role>): Promise<Role> {
    return this.repository.save(this.repository.create(role));
  }

  public findById(id: string): Promise<Role | null> {
    return this.repository.findOneBy({ id });
  }

  public findByName(name: string): Promise<Role | null> {
    return this.repository
      .createQueryBuilder("role")
      .withDeleted()
      .where("role.name = :name", { name })
      .getOne();
  }

  public async update(
    id: string,
    payload: Partial<Role>,
  ): Promise<Role | null> {
    const result = await this.repository.update({ id }, payload);
    if (result.affected !== 1) {
      return null;
    }
    return this.findById(id);
  }

  public async delete(
    id: string,
    payload: Record<string, any>,
  ): Promise<boolean> {
    const result = await this.repository.update({ id }, payload);
    if (result.affected !== 1) {
      return false;
    }
    return true;
  }

  public findPermissionsByIds(ids: string[]): Promise<Permission[]> {
    return OpenDataSource.getRepository(Permission).findBy({ id: In(ids) });
  }

  public async assignPermission(
    roleId: string,
    permissionIds: string[],
    baseAudit: Partial<RolePermission>,
  ): Promise<RolePermission[]> {
    const { created_at, created_by, ...baseUpdate } = baseAudit;
    return OpenDataSource.transaction(async (manager) => {
      const rolePermissionRepository = manager.getRepository(RolePermission);
      const existing = await rolePermissionRepository
        .createQueryBuilder("rolePermission")
        .withDeleted()
        .where("rolePermission.role_id = :roleId", { roleId })
        .andWhere("rolePermission.permission_id IN (:...permissionIds)", {
          permissionIds,
        })
        .getMany();
      const existingIds = new Set(
        existing.map((assignment) => assignment.permission_id),
      );
      const restored = existing
        .filter((assignment) => assignment.deleted_at)
        .map((assignment) =>
          rolePermissionRepository.merge(assignment, baseUpdate, {
            deleted_at: null,
            deleted_by: null,
          }),
        );
      const newAssignments = permissionIds
        .filter((permissionId) => !existingIds.has(permissionId))
        .map((permission_id) =>
          rolePermissionRepository.create({
            role_id: roleId,
            permission_id,
            created_at,
            created_by,
            ...baseUpdate,
          }),
        );

      if (restored.length > 0 || newAssignments.length > 0) {
        await rolePermissionRepository.save([...restored, ...newAssignments]);
      }

      return rolePermissionRepository.findBy({
        role_id: roleId,
        permission_id: In(permissionIds),
      });
    });
  }

  public async fetchPagination(
    query: In_DTO_RoleListQuery,
  ): Promise<In_RESULT_Pagination> {
    // Normalize filter
    const currentPage =
      Number(query?.page) > 0
        ? Math.floor(Number(query?.page))
        : PAGINATION_PROPERTIES.DEFAULT_PAGE;
    const perPage =
      Number(query?.limit) > 0
        ? Math.min(
            Math.floor(Number(query?.limit)),
            PAGINATION_PROPERTIES.MAX_LIMIT,
          )
        : PAGINATION_PROPERTIES.DEFAULT_LIMIT;
    const skip = (currentPage - 1) * perPage;

    // 2. Normalisasi sort
    const sortKey = String(query?.sort_by ?? "");
    const sortColumn = Object.prototype.hasOwnProperty.call(
      DEFAULT_SORT_COLUMN,
      sortKey,
    )
      ? DEFAULT_SORT_COLUMN[sortKey as T_RoleSortField]
      : DEFAULT_SORT_COLUMN.created_at;
    const orderBy: "ASC" | "DESC" =
      String(query?.order_by ?? "").toUpperCase() === "ASC" ? "ASC" : "DESC";

    // 3. Filter pencarian
    const builder = this.repository.createQueryBuilder("role");
    const search = query?.search?.toString().trim();

    if (search) {
      builder.andWhere(
        `(
          LOWER(role.name) LIKE LOWER(:search) OR
          LOWER(COALESCE(role.slug, '')) LIKE LOWER(:search) OR
          LOWER(COALESCE(role.description, '')) LIKE LOWER(:search)
        )`,
        { search: `%${search}%` },
      );
    }

    builder.orderBy(sortColumn, orderBy);
    if (sortColumn !== DEFAULT_SORT_COLUMN.id) {
      builder.addOrderBy(DEFAULT_SORT_COLUMN.id, "ASC"); // tie-breaker agar urutan stabil
    }
    builder.skip(skip).take(perPage);

    const [data, totalItems] = await builder.getManyAndCount();

    return {
      data,
      meta: {
        pagination: generatePaginationMeta(currentPage, perPage, totalItems),
        total_rows: totalItems,
      },
    } as In_RESULT_Pagination;
  }
}

export const repository = new RoleRepository();
