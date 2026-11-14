import { ProjectType } from "../../database/entities/project_type.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { ProjectTypeListQuery } from "./dto";
import { ProjectTypeRepository } from "./repository";

export class ProjectTypeService {
  private readonly repository: ProjectTypeRepository;

  constructor() {
    this.repository = new ProjectTypeRepository();
  }

  fetchPagination(query: ProjectTypeListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<ProjectType> {
    const projectType = await this.repository.findById(id);
    if (!projectType) throw notFoundError("project type");
    return projectType;
  }

  async create(input: Partial<ProjectType>): Promise<ProjectType> {
    if (
      input.name !== undefined &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("project type");
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("project type");
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: Partial<ProjectType>,
  ): Promise<ProjectType> {
    const projectType = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== projectType.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("project type");
    }

    if (input.name !== undefined) projectType.name = input.name;
    if (input.description !== undefined) {
      projectType.description = input.description;
    }

    try {
      return await this.repository.save({
        ...projectType,
        updated_at: input.updated_at ?? projectType.updated_at,
        updated_by: input.updated_by ?? projectType.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("project type");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<ProjectType>): Promise<void> {
    const projectType = await this.findById(id);
    await this.repository.softDelete({ ...projectType, ...audit });
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

export const projectTypeService = new ProjectTypeService();