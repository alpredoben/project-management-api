import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Permission } from "../../database/entities/permission.entity";
import { Role } from "../../database/entities/role.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { RoleListQuery } from "./dto";

export class RoleRepository {
  private readonly roles: Repository<Role>;
  private readonly permissions: Repository<Permission>;

  constructor() {
    this.roles = OpenDataSource.getRepository(Role);
    this.permissions = OpenDataSource.getRepository(Permission);
  }

  async fetchPagination(
    query: RoleListQuery,
  ): Promise<{ data: Role[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.roles
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permission")
      .select([
        "role.id",
        "role.name",
        "role.slug",
        "role.description",
        "role.created_at",
        "role.updated_at",
        "permission.id",
        "permission.name",
        "permission.module",
        "permission.description",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(role.name) LIKE LOWER(:search)
          OR LOWER(role.slug) LIKE LOWER(:search)
          OR LOWER(COALESCE(role.description, '')) LIKE LOWER(:search)
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`role.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<Role | null> {
    return this.roles.findOne({
      where: { id },
      relations: ["permissions"],
    });
  }

  findByName(name: string): Promise<Role | null> {
    return this.roles.findOne({ where: { name }, select: ["id"] });
  }

  findBySlug(slug: string): Promise<Role | null> {
    return this.roles.findOne({ where: { slug }, select: ["id"] });
  }

  findPermissionsByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.permissions
      .createQueryBuilder("permission")
      .where("permission.id IN (:...ids)", { ids })
      .getMany();
  }

  create(data: Partial<Role>): Role {
    return this.roles.create(data);
  }

  save(role: Role): Promise<Role> {
    return this.roles.save(role);
  }

  async softDelete(role: Role): Promise<void> {
    await this.roles.save(role);
  }
}