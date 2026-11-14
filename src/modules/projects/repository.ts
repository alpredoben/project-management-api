import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Milestone } from "../../database/entities/milestone.entity";
import { Project } from "../../database/entities/project.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { ProjectListQuery, ProjectMilestoneListQuery } from "./dto";

const MILESTONE_SORT_COLUMNS = {
  title: "milestone.title",
  due_date: "milestone.dueDate",
  status: "milestone.status",
  created_at: "milestone.created_at",
  updated_at: "milestone.updated_at",
} as const;

export class ProjectRepository {
  private readonly projects: Repository<Project>;
  private readonly milestones: Repository<Milestone>;

  constructor() {
    this.projects = OpenDataSource.getRepository(Project);
    this.milestones = OpenDataSource.getRepository(Milestone);
  }

  async fetchPagination(
    query: ProjectListQuery,
  ): Promise<{ data: Project[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.projects
      .createQueryBuilder("project")
      .select([
        "project.id",
        "project.workspace_id",
        "project.project_type_id",
        "project.project_status_id",
        "project.name",
        "project.key",
        "project.description",
        "project.start_date",
        "project.end_date",
        "project.created_at",
        "project.updated_at",
      ])
      .leftJoin("project.workspace", "workspace")
      .leftJoin("project.project_type", "projectType")
      .leftJoin("project.project_status", "projectStatus")
      .addSelect([
        "workspace.id",
        "workspace.name",
        "workspace.slug",
        "projectType.id",
        "projectType.name",
        "projectStatus.id",
        "projectStatus.name",
        "projectStatus.color_code",
        "projectStatus.sequence_order",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        "(LOWER(project.name) LIKE LOWER(:search) OR LOWER(project.key) LIKE LOWER(:search))",
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`project.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  async fetchMilestones(
    projectId: string,
    query: ProjectMilestoneListQuery,
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
      .where("project.id = :projectId", { projectId });

    if (query.search) {
      queryBuilder.andWhere(
        "(LOWER(milestone.title) LIKE LOWER(:search) OR LOWER(milestone.status) LIKE LOWER(:search))",
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(MILESTONE_SORT_COLUMNS[query.sortBy], query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<Project | null> {
    return this.projects.findOne({ where: { id } });
  }

  create(data: Partial<Project>): Project {
    return this.projects.create(data);
  }

  save(project: Project): Promise<Project> {
    return this.projects.save(project);
  }

  softDelete(project: Project): Promise<Project> {
    return this.projects.save(project);
  }
}