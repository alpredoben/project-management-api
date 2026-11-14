import { TaskType } from "../../database/entities/task_type.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { TaskTypeListQuery } from "./dto";
import { TaskTypeRepository } from "./repository";

export class TaskTypeService {
  private readonly repository: TaskTypeRepository;

  constructor() {
    this.repository = new TaskTypeRepository();
  }

  fetchPagination(query: TaskTypeListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<TaskType> {
    const taskType = await this.repository.findById(id);
    if (!taskType) throw notFoundError("jenis tugas");
    return taskType;
  }

  async create(input: Partial<TaskType>): Promise<TaskType> {
    if (
      input.name !== undefined &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("jenis tugas");
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("jenis tugas");
      }
      throw error;
    }
  }

  async update(id: string, input: Partial<TaskType>): Promise<TaskType> {
    const taskType = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== taskType.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("jenis tugas");
    }

    if (input.name !== undefined) taskType.name = input.name;
    if (input.icon !== undefined) taskType.icon = input.icon;

    try {
      return await this.repository.save({
        ...taskType,
        updated_at: input.updated_at ?? taskType.updated_at,
        updated_by: input.updated_by ?? taskType.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("jenis tugas");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<TaskType>): Promise<void> {
    const taskType = await this.findById(id);
    await this.repository.softDelete({ ...taskType, ...audit });
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

export const taskTypeService = new TaskTypeService();