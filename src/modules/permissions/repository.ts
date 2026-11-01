import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Permission } from "../../database/entities/permission.entity";
import {
  DEFAULT_SORT_COLUMN,
  In_DTO_PermissionListQuery,
  T_PermissionSortField,
} from "./dto";
import { PAGINATION_PROPERTIES } from "../../shared/constants";
import { generatePaginationMeta } from "../../shared/utils/pagination.util";
import { In_RESULT_Pagination } from "../../interfaces/dto.interface";

export class PermissionRepository {
  private get repository(): Repository<Permission> {
    return OpenDataSource.getRepository(Permission);
  }

  public create(permission: Partial<Permission>): Promise<Permission> {
    return this.repository.save(this.repository.create(permission));
  }

  public findById(id: string): Promise<Permission | null> {
    return this.repository.findOneBy({ id });
  }

  public findByName(name: string): Promise<Permission | null> {
    return this.repository
      .createQueryBuilder("permission")
      .withDeleted()
      .where("permission.name = :name", { name })
      .getOne();
  }

  public findBySlug(slug: string): Promise<Permission | null> {
    return this.repository
      .createQueryBuilder("permission")
      .withDeleted()
      .where("permission.slug = :slug", { slug })
      .getOne();
  }

  public async update(
    id: string,
    payload: Partial<Permission>,
  ): Promise<Permission | null> {
    const result = await this.repository.update({ id }, payload);
    if (result.affected !== 1) {
      return null;
    }
    return this.findById(id);
  }

  public async delete(
    id: string,
    payload: Partial<Permission>,
  ): Promise<boolean> {
    const result = await this.repository.update({ id }, payload);
    return result.affected === 1;
  }

  public async fetchPagination(
    query: In_DTO_PermissionListQuery,
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
      ? DEFAULT_SORT_COLUMN[sortKey as T_PermissionSortField]
      : DEFAULT_SORT_COLUMN.created_at;
    const orderBy: "ASC" | "DESC" =
      String(query?.order_by ?? "").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const builder = this.repository.createQueryBuilder("permission");
    const search = query?.search?.toString().trim();

    if (search) {
      builder.andWhere(
        `(
          LOWER(permission.name) LIKE LOWER(:search) OR
          LOWER(COALESCE(permission.slug, '')) LIKE LOWER(:search)
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

export const repository = new PermissionRepository();