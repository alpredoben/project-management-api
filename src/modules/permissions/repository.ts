import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Permission } from "../../database/entities/permission.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { PermissionListQuery } from "./dto";

export class PermissionRepository {
  private readonly permissions: Repository<Permission>;

  constructor() {
    this.permissions = OpenDataSource.getRepository(Permission);
  }

  async fetchPagination(
    query: PermissionListQuery,
  ): Promise<{ data: Permission[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.permissions
      .createQueryBuilder("permission")
      .select([
        "permission.id",
        "permission.name",
        "permission.module",
        "permission.description",
        "permission.created_at",
        "permission.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(permission.name) LIKE LOWER(:search)
          OR LOWER(permission.module) LIKE LOWER(:search)
          OR LOWER(COALESCE(permission.description, '')) LIKE LOWER(:search)
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`permission.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<Permission | null> {
    return this.permissions.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Permission | null> {
    return this.permissions.findOne({ where: { name } });
  }

  create(data: Partial<Permission>): Permission {
    return this.permissions.create(data);
  }

  save(permission: Permission): Promise<Permission> {
    return this.permissions.save(permission);
  }

  async softDelete(permission: Permission): Promise<void> {
    await this.permissions.save(permission);
  }
}