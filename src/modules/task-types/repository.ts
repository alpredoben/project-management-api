import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { TaskType } from "../../database/entities/task_type.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { TaskTypeListQuery } from "./dto";

export class TaskTypeRepository {
  private readonly taskTypes: Repository<TaskType>;

  constructor() {
    this.taskTypes = OpenDataSource.getRepository(TaskType);
  }

  async fetchPagination(
    query: TaskTypeListQuery,
  ): Promise<{ data: TaskType[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.taskTypes
      .createQueryBuilder("taskType")
      .select([
        "taskType.id",
        "taskType.name",
        "taskType.icon",
        "taskType.created_at",
        "taskType.updated_at",
      ]);

    if (query.search) {
      queryBuilder.andWhere("LOWER(taskType.name) LIKE LOWER(:search)", {
        search: `%${query.search}%`,
      });
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`taskType.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<TaskType | null> {
    return this.taskTypes.findOne({ where: { id } });
  }

  findByName(name: string): Promise<TaskType | null> {
    return this.taskTypes.findOne({
      where: { name },
      select: ["id"],
    });
  }

  create(data: Partial<TaskType>): TaskType {
    return this.taskTypes.create(data);
  }

  save(taskType: TaskType): Promise<TaskType> {
    return this.taskTypes.save(taskType);
  }

  softDelete(taskType: TaskType): Promise<TaskType> {
    return this.taskTypes.save(taskType);
  }
}