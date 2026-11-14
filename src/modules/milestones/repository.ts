import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Milestone } from "../../database/entities/milestone.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { MilestoneListQuery } from "./dto";

const SORT_COLUMNS = {
  project_id: "milestone.project_id",
  title: "milestone.title",
  due_date: "milestone.dueDate",
  status: "milestone.status",
  created_at: "milestone.created_at",
  updated_at: "milestone.updated_at",
} as const;

export class MilestoneRepository {
  private readonly milestones: Repository<Milestone>;

  constructor() {
    this.milestones = OpenDataSource.getRepository(Milestone);
  }

  async fetchPagination(
    query: MilestoneListQuery,
  ): Promise<{ data: Milestone[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.milestones
      .createQueryBuilder("milestone")
      .select([
        "milestone.id",
        "milestone.project_id",
        "milestone.title",
        "milestone.description",
        "milestone.dueDate",
        "milestone.status",
        "milestone.created_at",
        "milestone.updated_at",
      ])
      .leftJoin("milestone.project", "project")
      .addSelect(["project.id", "project.name", "project.key"]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(milestone.title) LIKE LOWER(:search)
          OR LOWER(milestone.status) LIKE LOWER(:search)
          OR LOWER(project.name) LIKE LOWER(:search)
          OR LOWER(project.key) LIKE LOWER(:search)
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(SORT_COLUMNS[query.sortBy], query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<Milestone | null> {
    return this.milestones.findOne({ where: { id } });
  }

  create(data: Partial<Milestone>): Milestone {
    return this.milestones.create(data);
  }

  save(milestone: Milestone): Promise<Milestone> {
    return this.milestones.save(milestone);
  }

  softDelete(milestone: Milestone): Promise<Milestone> {
    return this.milestones.save(milestone);
  }
}