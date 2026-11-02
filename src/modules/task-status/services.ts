import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import {
  In_DTO_CreateTaskStatus,
  In_DTO_TaskStatus,
  In_DTO_TaskStatusListQuery,
  In_DTO_UpdateTaskStatus,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

const LABEL = "Status task";

export class TaskStatusService {
  public async store(
    { status_name, sort_order }: In_DTO_CreateTaskStatus,
    audit: T_Audit,
  ): Promise<In_DTO_TaskStatus> {
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

  public async fetchById(id: string): Promise<In_DTO_TaskStatus> {
    const result = await repository.findById(id);
    if (!result) {
      throw notFoundError(LABEL);
    }
    return result;
  }

  public async update(
    id: string,
    { status_name, sort_order }: In_DTO_UpdateTaskStatus,
    audit: T_Audit,
  ): Promise<In_DTO_TaskStatus> {
    await Promise.all([
      status_name === undefined
        ? undefined
        : this.assertNameFree(status_name, id),
      sort_order === undefined
        ? undefined
        : this.assertSortOrderFree(sort_order, id),
    ]);

    const updated = await repository.update(id, {
      ...(status_name !== undefined && { task_status_name: status_name }),
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
        "Status task masih digunakan oleh task.",
        HTTP_STATUS.CONFLICT,
      );
    }
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError(LABEL);
    }
  }

  public fetchPagination(query: In_DTO_TaskStatusListQuery) {
    return repository.fetchPagination(query);
  }

  private async assertNameFree(name: string, exceptId?: string): Promise<void> {
    if (await repository.isNameTaken(name, exceptId)) {
      throw existsError("Nama status task");
    }
  }

  private async assertSortOrderFree(
    sortOrder: number,
    exceptId?: string,
  ): Promise<void> {
    if (await repository.isSortOrderTaken(sortOrder, exceptId)) {
      throw existsError("No. urut status task");
    }
  }
}

export const service = new TaskStatusService();
