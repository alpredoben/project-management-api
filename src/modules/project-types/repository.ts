import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { ProjectType } from "../../database/entities/project_type.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { ProjectTypeListQuery } from "./dto";

export class ProjectTypeRepository {
  private readonly projectTypes: Repository<ProjectType>;

  constructor() {
    this.projectTypes = OpenDataSource.getRepository(ProjectType);
  }

  async fetchPagination(
    query: ProjectTypeListQuery,
  ): Promise<{ data: ProjectType[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.projectTypes
      .createQueryBuilder("p")
      .select([
        "p.id",
        "p.name",
        "p.description",
        "p.created_at",
        "p.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere("LOWER(p.name) LIKE LOWER(:search)", {
        search: `%${query.search}%`,
      });
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`p.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<ProjectType | null> {
    return this.projectTypes.findOne({ where: { id } });
  }

  findByName(name: string): Promise<ProjectType | null> {
    return this.projectTypes.findOne({
      where: { name },
      select: ["id"],
    });
  }

  create(data: Partial<ProjectType>): ProjectType {
    return this.projectTypes.create(data);
  }

  save(projectType: ProjectType): Promise<ProjectType> {
    return this.projectTypes.save(projectType);
  }

  softDelete(projectType: ProjectType): Promise<ProjectType> {
    return this.projectTypes.save(projectType);
  }
}