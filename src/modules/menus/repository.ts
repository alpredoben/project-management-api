import { In, IsNull, Not, Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Menu } from "../../database/entities/menu.entity";
import { Permission } from "../../database/entities/permission.entity";
import { RoleMenuPermission } from "../../database/entities/roleMenuPermission.entity";
import { RolePermission } from "../../database/entities/rolePermission.entity";
import { Role } from "../../database/entities/role.entity";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";
import { PAGINATION_PROPERTIES } from "../../shared/constants";
import { generatePaginationMeta } from "../../shared/utils/pagination.util";
import {
  DEFAULT_SORT_COLUMN,
  In_DTO_MenuListQuery,
  T_MenuSortField,
} from "./dto";

export class MenuRepository {
  private get repository(): Repository<Menu> {
    return OpenDataSource.getRepository(Menu);
  }

  public checkOrderNumberExists(payload: {
    order_number: number;
    parent_id?: string | null;
    id?: string | null;
  }): Promise<boolean> {
    let baseConditions: any[];

    if (payload.parent_id == null) {
      baseConditions = [
        { order_number: payload.order_number },
        { parent_id: IsNull() },
      ];
    } else {
      baseConditions = [
        { order_number: payload.order_number },
        { parent_id: payload.parent_id },
      ];
    }

    const whereConditions = baseConditions.map((condition) => {
      const newCondition = { ...condition };
      if (payload.id != null) {
        newCondition.id = Not(payload.id);
      }
      return newCondition;
    });

    const exists = this.repository.exists({
      where: whereConditions,
    });

    return exists;
  }

  public create(menu: Partial<Menu>): Promise<Menu> {
    return this.repository.save(this.repository.create(menu));
  }

  public findById(id: string): Promise<Menu | null> {
    return this.repository.findOneBy({ id });
  }

  public findBySlug(slug: string): Promise<Menu | null> {
    return this.repository
      .createQueryBuilder("menu")
      .withDeleted()
      .where("menu.slug = :slug", { slug })
      .getOne();
  }

  public async update(
    id: string,
    payload: Partial<Menu>,
  ): Promise<Menu | null> {
    const result = await this.repository.update({ id }, payload);
    if (result.affected !== 1) {
      return null;
    }
    return this.findById(id);
  }

  public async delete(id: string, payload: Partial<Menu>): Promise<boolean> {
    const result = await this.repository.update({ id }, payload);
    return result.affected === 1;
  }

  public findRoleById(id: string): Promise<Role | null> {
    return OpenDataSource.getRepository(Role).findOneBy({ id });
  }

  public findPermissionIdsByIds(ids: string[]): Promise<Permission[]> {
    return OpenDataSource.getRepository(Permission).findBy({ id: In(ids) });
  }

  public async findAssignedPermissionIds(
    roleId: string,
    permissionIds: string[],
  ): Promise<string[]> {
    const assignments = await OpenDataSource.getRepository(RolePermission)
      .createQueryBuilder("rolePermission")
      .select("rolePermission.permission_id", "permission_id")
      .where("rolePermission.role_id = :roleId", { roleId })
      .andWhere("rolePermission.permission_id IN (:...permissionIds)", {
        permissionIds,
      })
      .getRawMany<{ permission_id: string }>();
    return assignments.map(({ permission_id }) => permission_id);
  }

  public async addRolePermissionMenu(
    roleId: string,
    menuId: string,
    permissionIds: string[],
    audit: Partial<RoleMenuPermission>,
  ): Promise<RoleMenuPermission[]> {
    const { created_at, created_by, ...updateAudit } = audit;
    return OpenDataSource.transaction(async (manager) => {
      const assignmentRepository = manager.getRepository(RoleMenuPermission);
      const existing = await assignmentRepository
        .createQueryBuilder("assignment")
        .withDeleted()
        .where("assignment.role_id = :roleId", { roleId })
        .andWhere("assignment.menu_id = :menuId", { menuId })
        .andWhere("assignment.permission_id IN (:...permissionIds)", {
          permissionIds,
        })
        .getMany();
      const existingIds = new Set(
        existing.map((assignment) => assignment.permission_id),
      );
      const restored = existing
        .filter((assignment) => assignment.deleted_at)
        .map((assignment) =>
          assignmentRepository.merge(assignment, updateAudit, {
            deleted_at: null,
            deleted_by: null,
          }),
        );
      const newAssignments = permissionIds
        .filter((permissionId) => !existingIds.has(permissionId))
        .map((permission_id) =>
          assignmentRepository.create({
            role_id: roleId,
            menu_id: menuId,
            permission_id,
            created_at,
            created_by,
            ...updateAudit,
          }),
        );

      if (restored.length > 0 || newAssignments.length > 0) {
        await assignmentRepository.save([...restored, ...newAssignments]);
      }

      return assignmentRepository.findBy({
        role_id: roleId,
        menu_id: menuId,
        permission_id: In(permissionIds),
      });
    });
  }

  public async fetchPagination(
    query: In_DTO_MenuListQuery,
  ): Promise<In_RESULT_Pagination> {
    const currentPage =
      Number(query?.page) > 0
        ? Math.floor(Number(query.page))
        : PAGINATION_PROPERTIES.DEFAULT_PAGE;
    const perPage =
      Number(query?.limit) > 0
        ? Math.min(
            Math.floor(Number(query.limit)),
            PAGINATION_PROPERTIES.MAX_LIMIT,
          )
        : PAGINATION_PROPERTIES.DEFAULT_LIMIT;
    const skip = (currentPage - 1) * perPage;
    const sortKey = String(query?.sort_by ?? "");
    const sortColumn = Object.prototype.hasOwnProperty.call(
      DEFAULT_SORT_COLUMN,
      sortKey,
    )
      ? DEFAULT_SORT_COLUMN[sortKey as T_MenuSortField]
      : DEFAULT_SORT_COLUMN.created_at;
    const orderBy: "ASC" | "DESC" =
      String(query?.order_by ?? "").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const builder = this.repository.createQueryBuilder("menu");
    const search = query?.search?.toString().trim();
    if (search) {
      builder.andWhere(
        `(
          LOWER(menu.name) LIKE LOWER(:search) OR
          LOWER(menu.slug) LIKE LOWER(:search) OR
          LOWER(menu.path) LIKE LOWER(:search)
        )`,
        { search: `%${search}%` },
      );
    }

    builder.orderBy(sortColumn, orderBy);
    if (sortColumn !== DEFAULT_SORT_COLUMN.id) {
      builder.addOrderBy(DEFAULT_SORT_COLUMN.id, "ASC");
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

export const repository = new MenuRepository();
