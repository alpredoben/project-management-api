import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Workspace } from "../../database/entities/workspace.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { WorkspaceListQuery } from "./dto";

export class WorkspaceRepository {
  private readonly workspaces: Repository<Workspace>;

  constructor() {
    this.workspaces = OpenDataSource.getRepository(Workspace);
  }

  async fetchPagination(
    query: WorkspaceListQuery,
  ): Promise<{ data: Workspace[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.workspaces
      .createQueryBuilder("workspace")
      .select([
        "workspace.id",
        "workspace.name",
        "workspace.slug",
        "workspace.logo_url",
        "workspace.created_at",
        "workspace.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(workspace.name) LIKE LOWER(:search)
          OR LOWER(workspace.slug) LIKE LOWER(:search)
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`workspace.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<Workspace | null> {
    return this.workspaces.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Workspace | null> {
    return this.workspaces.findOne({
      where: { slug },
      select: ["id"],
    });
  }

  create(data: Partial<Workspace>): Workspace {
    return this.workspaces.create(data);
  }

  save(workspace: Workspace): Promise<Workspace> {
    return this.workspaces.save(workspace);
  }

  softDelete(workspace: Workspace): Promise<Workspace> {
    return this.workspaces.save(workspace);
  }
}