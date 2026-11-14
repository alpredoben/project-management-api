import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { ProjectStatus } from "../../database/entities/project_status.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { ProjectStatusListQuery } from "./dto";

export class ProjectStatusRepository {
  private readonly projectStatuses: Repository<ProjectStatus>;

  constructor() {
    this.projectStatuses = OpenDataSource.getRepository(ProjectStatus);
  }

  async fetchPagination(
    query: ProjectStatusListQuery,
  ): Promise<{ data: ProjectStatus[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.projectStatuses
      .createQueryBuilder("ps")
      .select([
        "ps.id",
        "ps.name",
        "ps.color_code",
        "ps.sequence_order",
        "ps.created_at",
        "ps.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere("LOWER(ps.name) LIKE LOWER(:search)", {
        search: `%${query.search}%`,
      });
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`ps.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    console.log({data})

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<ProjectStatus | null> {
    return this.projectStatuses.findOne({ where: { id } });
  }

  findByName(name: string): Promise<ProjectStatus | null> {
    return this.projectStatuses.findOne({
      where: { name },
      select: ["id"],
    });
  }

  create(data: Partial<ProjectStatus>): ProjectStatus {
    return this.projectStatuses.create(data);
  }

  save(status: ProjectStatus): Promise<ProjectStatus> {
    return this.projectStatuses.save(status);
  }

  softDelete(status: ProjectStatus): Promise<ProjectStatus> {
    return this.projectStatuses.save(status);
  }
}