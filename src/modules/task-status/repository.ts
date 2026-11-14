import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { TaskStatus } from "../../database/entities/task_status.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { TaskStatusListQuery } from "./dto";

export class TaskStatusRepository {
  private readonly taskStatuses: Repository<TaskStatus>;

  constructor() {
    this.taskStatuses = OpenDataSource.getRepository(TaskStatus);
  }

  async fetchPagination(
    query: TaskStatusListQuery,
  ): Promise<{ data: TaskStatus[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.taskStatuses
      .createQueryBuilder("taskStatus")
      .select([
        "taskStatus.id",
        "taskStatus.name",
        "taskStatus.color_code",
        "taskStatus.sequence_order",
        "taskStatus.is_closed",
        "taskStatus.created_at",
        "taskStatus.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere("LOWER(taskStatus.name) LIKE LOWER(:search)", {
        search: `%${query.search}%`,
      });
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`taskStatus.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<TaskStatus | null> {
    return this.taskStatuses.findOne({ where: { id } });
  }

  findByName(name: string): Promise<TaskStatus | null> {
    return this.taskStatuses.findOne({
      where: { name },
      select: ["id"],
    });
  }

  create(data: Partial<TaskStatus>): TaskStatus {
    return this.taskStatuses.create(data);
  }

  save(status: TaskStatus): Promise<TaskStatus> {
    return this.taskStatuses.save(status);
  }

  softDelete(status: TaskStatus): Promise<TaskStatus> {
    return this.taskStatuses.save(status);
  }
}