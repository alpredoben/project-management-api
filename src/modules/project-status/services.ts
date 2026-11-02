import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import {
  In_DTO_CreateProjectStatus,
  In_DTO_ProjectStatus,
  In_DTO_ProjectStatusListQuery,
  In_DTO_UpdateProjectStatus,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

const LABEL = "Status project";

export class ProjectStatusService {
  public async store(
    { status_name, sort_order }: In_DTO_CreateProjectStatus,
    audit: T_Audit,
  ): Promise<In_DTO_ProjectStatus> {
    await Promise.all([
      this.assertNameFree(status_name),
      this.assertSortOrderFree(sort_order),
    ]);
    return repository.create({
      status_name,
      sort_order,
      ...audit,
    });
  }

  public async fetchById(id: string): Promise<In_DTO_ProjectStatus> {
    const projectStatus = await repository.findById(id);
    if (!projectStatus) {
      throw notFoundError(LABEL);
    }
    return projectStatus;
  }

  public async update(
    id: string,
    { status_name, sort_order }: In_DTO_UpdateProjectStatus,
    audit: T_Audit,
  ): Promise<In_DTO_ProjectStatus> {
    await Promise.all([
      status_name === undefined
        ? undefined
        : this.assertNameFree(status_name, id),
      sort_order === undefined
        ? undefined
        : this.assertSortOrderFree(sort_order, id),
    ]);

    const updated = await repository.update(id, {
      ...(status_name !== undefined && { project_status_name: status_name }),
      ...(sort_order !== undefined && { sort_order }),
      ...audit,
    });
    if (!updated) {
      throw notFoundError(LABEL);
    }
    return updated;
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    if (await repository.isInUse(id)) {
      throw new AppError(
        "Status project masih digunakan oleh project.",
        HTTP_STATUS.CONFLICT,
      );
    }
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError(LABEL);
    }
  }

  public fetchPagination(query: In_DTO_ProjectStatusListQuery) {
    return repository.fetchPagination(query);
  }

  private async assertNameFree(name: string, exceptId?: string): Promise<void> {
    if (await repository.isNameTaken(name, exceptId)) {
      throw existsError("Nama status project");
    }
  }

  private async assertSortOrderFree(
    sortOrder: number,
    exceptId?: string,
  ): Promise<void> {
    if (await repository.isSortOrderTaken(sortOrder, exceptId)) {
      throw existsError("No. urut status project");
    }
  }
}

export const service = new ProjectStatusService();
