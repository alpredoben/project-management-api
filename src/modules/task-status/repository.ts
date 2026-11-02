import { IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Task } from "../../database/entities/tasks.entity";
import { TaskStatus } from "../../database/entities/taskStatus.entity";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { escapeLike } from "../../shared/utils/sql.util";
import {
  In_DTO_TaskStatus,
  In_DTO_TaskStatusListItem,
  In_DTO_TaskStatusListQuery,
  T_Audit,
  T_TaskStatusSortField,
} from "./dto";

const SORT_COLUMNS: Record<T_TaskStatusSortField, string> = {
  id: "ts.id",
  status_name: "ts.task_status_name",
  sort_order: "ts.sort_order",
  created_at: "ts.created_at",
  updated_at: "ts.updated_at",
};

const RETURNING =
  "id, task_status_name AS status_name, sort_order, created_at, updated_at";

export class TaskStatusRepository {
  private get repository(): Repository<TaskStatus> {
    return OpenDataSource.getRepository(TaskStatus);
  }

  public findById(id: string): Promise<In_DTO_TaskStatus | undefined> {
    return this.selectColumns()
      .where("ts.id = :id", { id })
      .getRawOne<In_DTO_TaskStatus>();
  }

  /** Nama unik (tanpa membedakan huruf besar/kecil), termasuk yang sudah di-soft-delete. */
  public isNameTaken(name: string, exceptId?: string): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("ts")
      .withDeleted()
      .where("LOWER(ts.task_status_name) = LOWER(:name)", { name });
    return this.excluding(builder, exceptId).getExists();
  }

  public isSortOrderTaken(
    sortOrder: number,
    exceptId?: string,
  ): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("ts")
      .where("ts.sort_order = :sortOrder", { sortOrder });
    return this.excluding(builder, exceptId).getExists();
  }

  /** Status masih dipakai oleh task aktif. */
  public isInUse(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(Task).existsBy({
      task_status_id: id,
    });
  }

  public async create(
    payload: Partial<TaskStatus>,
  ): Promise<In_DTO_TaskStatus> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(TaskStatus)
      .values(payload)
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_TaskStatus[])[0];
  }

  /** Update status aktif dan langsung mengembalikan barisnya (satu query). */
  public async update(
    id: string,
    patch: Partial<TaskStatus>,
  ): Promise<In_DTO_TaskStatus | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update()
      .set(patch)
      .where("id = :id AND deleted_at IS NULL", { id })
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_TaskStatus[])[0] ?? null;
  }

  public async softDelete(id: string, audit: T_Audit): Promise<boolean> {
    const { affected } = await this.repository.update(
      { id, deleted_at: IsNull() },
      audit,
    );
    return Boolean(affected);
  }

  public async fetchPagination({
    page,
    limit,
    sort_by,
    order_by,
    search,
  }: In_DTO_TaskStatusListQuery) {
    const sortColumn = SORT_COLUMNS[sort_by];
    const [data, totalItems] = await Promise.all([
      this.applySearch(this.selectColumns(), search)
        .addSelect(
          `CAST(ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${order_by}, ts.id ASC) AS int)`,
          "no",
        )
        .orderBy(sortColumn, order_by)
        .addOrderBy("ts.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<In_DTO_TaskStatusListItem>(),
      this.applySearch(
        this.repository.createQueryBuilder("ts"),
        search,
      ).getCount(),
    ]);
    return toPaginationResult(data, page, limit, totalItems);
  }

  private selectColumns(): SelectQueryBuilder<TaskStatus> {
    return this.repository
      .createQueryBuilder("ts")
      .select("ts.id", "id")
      .addSelect("ts.status_name", "status_name")
      .addSelect("ts.sort_order", "sort_order")
      .addSelect("ts.created_at", "created_at")
      .addSelect("ts.updated_at", "updated_at");
  }

  private excluding(
    builder: SelectQueryBuilder<TaskStatus>,
    exceptId?: string,
  ): SelectQueryBuilder<TaskStatus> {
    return exceptId
      ? builder.andWhere("ts.id <> :exceptId", { exceptId })
      : builder;
  }

  private applySearch(
    builder: SelectQueryBuilder<TaskStatus>,
    search: string,
  ): SelectQueryBuilder<TaskStatus> {
    return search
      ? builder.andWhere("ts.status_name ILIKE :search", {
          search: `%${escapeLike(search)}%`,
        })
      : builder;
  }
}

export const repository = new TaskStatusRepository();
