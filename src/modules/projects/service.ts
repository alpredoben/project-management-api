import { Project } from "../../database/entities/project.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { HTTP_STATUS } from "../../shared/constants";
import { AppError, notFoundError } from "../../shared/utils/error.util";
import i18next from "i18next";
import { projectStatusService } from "../project-status/service";
import { projectTypeService } from "../project-types/service";
import { workspaceService } from "../workspaces/service";
import { ProjectListQuery, ProjectMilestoneListQuery } from "./dto";
import { ProjectRepository } from "./repository";
import { Milestone } from "../../database/entities/milestone.entity";

export class ProjectService {
  private readonly repository: ProjectRepository;

  constructor() {
    this.repository = new ProjectRepository();
  }

  fetchPagination(query: ProjectListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<Project> {
    const project = await this.repository.findById(id);
    if (!project) throw notFoundError("proyek");
    return project;
  }

  async fetchMilestones(
    id: string,
    query: ProjectMilestoneListQuery,
  ): Promise<{ data: Milestone[]; meta: In_API_AttributMeta }> {
    await this.findById(id);
    return this.repository.fetchMilestones(id, query);
  }

  async create(
    input: Partial<Project> & Pick<Project, "workspace_id" | "name" | "key">,
  ): Promise<Project> {
    await this.validateReferences(input);
    this.validateDateRange(input.start_date, input.end_date);
    return this.repository.save(this.repository.create(input));
  }

  async update(id: string, input: Partial<Project>): Promise<Project> {
    const project = await this.findById(id);
    await this.validateReferences(input);

    if (input.workspace_id !== undefined) {
      project.workspace_id = input.workspace_id;
    }
    if (input.project_type_id !== undefined) {
      project.project_type_id = input.project_type_id;
    }
    if (input.project_status_id !== undefined) {
      project.project_status_id = input.project_status_id;
    }
    if (input.name !== undefined) project.name = input.name;
    if (input.key !== undefined) project.key = input.key;
    if (input.description !== undefined) project.description = input.description;
    if (input.start_date !== undefined) project.start_date = input.start_date;
    if (input.end_date !== undefined) project.end_date = input.end_date;

    this.validateDateRange(project.start_date, project.end_date);

    return this.repository.save({
      ...project,
      updated_at: input.updated_at ?? project.updated_at,
      updated_by: input.updated_by ?? project.updated_by,
    });
  }

  async changeStatus(
    id: string,
    statusId: string | null,
    audit: Partial<Project>,
  ): Promise<Project> {
    const project = await this.findById(id);
    if (statusId !== null) await projectStatusService.findById(statusId);
    project.project_status_id = statusId;

    return this.repository.save({ ...project, ...audit });
  }

  async changeType(
    id: string,
    typeId: string | null,
    audit: Partial<Project>,
  ): Promise<Project> {
    const project = await this.findById(id);
    if (typeId !== null) await projectTypeService.findById(typeId);
    project.project_type_id = typeId;

    return this.repository.save({ ...project, ...audit });
  }

  async delete(id: string, audit: Partial<Project>): Promise<void> {
    const project = await this.findById(id);
    await this.repository.softDelete({ ...project, ...audit });
  }

  private async validateReferences(input: Partial<Project>): Promise<void> {
    if (input.workspace_id !== undefined) {
      await workspaceService.findById(input.workspace_id);
    }
    if (input.project_status_id) {
      await projectStatusService.findById(input.project_status_id);
    }
    if (input.project_type_id) {
      await projectTypeService.findById(input.project_type_id);
    }
  }

  private validateDateRange(
    startDate: string | null | undefined,
    endDate: string | null | undefined,
  ): void {
    if (startDate && endDate && endDate < startDate) {
      throw new AppError(
        i18next.t("error.default.afterOrEqual", {
          m: "end_date",
          target: "start_date",
        }),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}

export const projectService = new ProjectService();