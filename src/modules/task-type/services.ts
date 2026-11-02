import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import {
  In_DTO_CreateTaskType,
  In_DTO_TaskType,
  In_DTO_TaskTypeListQuery,
  In_DTO_UpdateTaskType,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

const LABEL = "Tipe task";

export class TaskTypeService {
  public async store(
    { type_name, sort_order }: In_DTO_CreateTaskType,
    audit: T_Audit,
  ): Promise<In_DTO_TaskType> {
    await this.assertAvailable({ type_name, sort_order });
    return repository.create({ type_name, sort_order, ...audit });
  }

  public async fetchById(id: string): Promise<In_DTO_TaskType> {
    const result = await repository.findById(id);
    if (!result) {
      throw notFoundError(LABEL);
    }
    return result;
  }

  public async update(
    id: string,
    fields: In_DTO_UpdateTaskType,
    audit: T_Audit,
  ): Promise<In_DTO_TaskType> {
    await this.assertAvailable(fields, id);

    const updated = await repository.update(id, { ...fields, ...audit });
    if (!updated) {
      throw notFoundError(LABEL);
    }
    return updated;
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    if (await repository.isInUse(id)) {
      throw new AppError(
        "Tipe task masih digunakan oleh task.",
        HTTP_STATUS.CONFLICT,
      );
    }
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError(LABEL);
    }
  }

  public fetchPagination(query: In_DTO_TaskTypeListQuery) {
    return repository.fetchPagination(query);
  }

  /** Nama dan no. urut harus unik; keduanya dicek dalam satu query. */
  private async assertAvailable(
    fields: In_DTO_UpdateTaskType,
    exceptId?: string,
  ): Promise<void> {
    const { name_taken, sort_order_taken } = await repository.findConflicts(
      fields,
      exceptId,
    );
    if (name_taken) {
      throw existsError("Nama tipe task");
    }
    if (sort_order_taken) {
      throw existsError("No. urut tipe task");
    }
  }
}

export const service = new TaskTypeService();
