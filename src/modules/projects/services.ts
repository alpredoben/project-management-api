import { Project } from "../../database/entities";
import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import {
  In_DTO_CreateProject,
  In_DTO_Project,
  In_DTO_ProjectListQuery,
  In_DTO_UpdateProject,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

const LABEL = "Project";

export class ProjectService {
  public async store(
    project: In_DTO_CreateProject,
    audit: T_Audit,
  ): Promise<In_DTO_Project> {
    await this.assertReferences(project);
    await this.assertAvailable(
      project.project_code,
      project.project_name,
      project.owner_id ?? null,
    );
    return repository.create({
      ...project,
      max_contributors: project.max_contributors ?? 0,
      ...audit,
    });
  }

  public async fetchById(id: string): Promise<Project | undefined> {
    const project = await repository.findById(id);
    if (!project) {
      throw notFoundError(LABEL);
    }
    return project;
  }

  public async update(
    id: string,
    fields: In_DTO_UpdateProject,
    audit: T_Audit,
  ): Promise<In_DTO_Project> {
    const existing = await this.fetchById(id);
    const updatedProject = { ...existing, ...fields };
    await this.assertReferences(fields, id);
    await this.assertAvailable(
      updatedProject.project_code,
      updatedProject.project_name,
      updatedProject.owner_id ?? null,
      id,
    );

    const updated = await repository.update(id, { ...fields, ...audit });
    if (!updated) {
      throw notFoundError(LABEL);
    }
    return updated;
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    const [hasChildren, hasTasks] = await Promise.all([
      repository.hasActiveChildren(id),
      repository.hasTasks(id),
    ]);
    if (hasChildren || hasTasks) {
      throw new AppError(
        "Project masih memiliki project turunan atau task yang aktif.",
        HTTP_STATUS.CONFLICT,
      );
    }
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError(LABEL);
    }
  }

  public fetchPagination(query: In_DTO_ProjectListQuery) {
    return repository.fetchPagination(query);
  }

  private async assertReferences(
    fields: In_DTO_UpdateProject,
    exceptId?: string,
  ): Promise<void> {
    const checks: Promise<void>[] = [];
    if (fields.project_type_id) {
      checks.push(
        this.assertReference(
          repository.hasProjectType(fields.project_type_id),
          "Tipe project",
        ),
      );
    }
    if (fields.project_status_id) {
      checks.push(
        this.assertReference(
          repository.hasProjectStatus(fields.project_status_id),
          "Status project",
        ),
      );
    }
    if (fields.owner_id) {
      checks.push(
        this.assertReference(
          repository.hasOwner(fields.owner_id),
          "Owner project",
        ),
      );
    }
    if (fields.parent_id) {
      if (fields.parent_id === exceptId) {
        throw new AppError(
          "Project tidak dapat menjadi parent untuk dirinya sendiri.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      checks.push(
        this.assertReference(
          repository.hasParent(fields.parent_id),
          "Parent project",
        ),
      );
    }
    await Promise.all(checks);
  }

  private async assertReference(
    referenceExists: Promise<boolean>,
    label: string,
  ): Promise<void> {
    if (!(await referenceExists)) {
      throw notFoundError(label);
    }
  }

  private async assertAvailable(
    projectCode: string | undefined,
    projectName: string | undefined,
    ownerId: string | null,
    exceptId?: string,
  ): Promise<void> {
    if (!projectCode && !projectName) {
      throw existsError("Kode project atau nama project");
    }

    const conflicts = await repository.findConflicts(
      projectCode,
      projectName,
      ownerId,
      exceptId,
    );
    if (conflicts.code_taken) {
      throw existsError("Kode project");
    }
    if (conflicts.name_taken) {
      throw existsError("Nama project pada owner tersebut");
    }
  }
}

export const service = new ProjectService();
