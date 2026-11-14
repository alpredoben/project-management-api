import { TaskStatus } from "../../database/entities/task_status.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { TaskStatusListQuery } from "./dto";
import { TaskStatusRepository } from "./repository";

export class TaskStatusService {
  private readonly repository: TaskStatusRepository;

  constructor() {
    this.repository = new TaskStatusRepository();
  }

  fetchPagination(query: TaskStatusListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<TaskStatus> {
    const status = await this.repository.findById(id);
    if (!status) throw notFoundError("status tugas");
    return status;
  }

  async create(input: Partial<TaskStatus>): Promise<TaskStatus> {
    if (
      input.name !== undefined &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("status tugas");
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("status tugas");
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: Partial<TaskStatus>,
  ): Promise<TaskStatus> {
    const status = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== status.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("status tugas");
    }

    if (input.name !== undefined) status.name = input.name;
    if (input.color_code !== undefined) status.color_code = input.color_code;
    if (input.sequence_order !== undefined) {
      status.sequence_order = input.sequence_order;
    }
    if (input.is_closed !== undefined) status.is_closed = input.is_closed;

    try {
      return await this.repository.save({
        ...status,
        updated_at: input.updated_at ?? status.updated_at,
        updated_by: input.updated_by ?? status.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("status tugas");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<TaskStatus>): Promise<void> {
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

export const taskStatusService = new TaskStatusService();