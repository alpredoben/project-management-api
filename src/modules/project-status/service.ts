import { ProjectStatus } from "../../database/entities/project_status.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { ProjectStatusListQuery } from "./dto";
import { ProjectStatusRepository } from "./repository";

export class ProjectStatusService {
  private readonly repository: ProjectStatusRepository;

  constructor() {
    this.repository = new ProjectStatusRepository();
  }

  fetchPagination(query: ProjectStatusListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<ProjectStatus> {
    const status = await this.repository.findById(id);
    if (!status) throw notFoundError("project status");
    return status;
  }

  async create(input: Partial<ProjectStatus>): Promise<ProjectStatus> {
    if (input.name !== undefined && (await this.repository.findByName(input.name))) {
      throw existsError("project status");
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("project status");
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: Partial<ProjectStatus>,
  ): Promise<ProjectStatus> {
    const status = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== status.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("project status");
    }

    if (input.name !== undefined) status.name = input.name;
    if (input.color_code !== undefined) status.color_code = input.color_code;
    if (input.sequence_order !== undefined) {
      status.sequence_order = input.sequence_order;
    }

    try {
      return await this.repository.save({
        ...status,
        updated_at: input.updated_at ?? status.updated_at,
        updated_by: input.updated_by ?? status.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("project status");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<ProjectStatus>): Promise<void> {
    const status = await this.findById(id);
    await this.repository.softDelete({ ...status, ...audit });
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "driverError" in error &&
      typeof error.driverError === "object" &&
      error.driverError !== null &&
      "code" in error.driverError &&
      ["23505", "ER_DUP_ENTRY", 1062].includes(
        error.driverError.code as string | number,
      )
    );
  }
}

export const projectStatusService = new ProjectStatusService();