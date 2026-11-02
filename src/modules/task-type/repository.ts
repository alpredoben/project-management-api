import { IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Task, TaskType } from "../../database/entities";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { escapeLike } from "../../shared/utils/sql.util";
import {
  In_DTO_TaskType,
  In_DTO_TaskTypeConflict,
  In_DTO_TaskTypeListItem,
  In_DTO_TaskTypeListQuery,
  In_DTO_UpdateTaskType,
  TASK_TYPE_COLUMNS,
  T_Audit,
} from "./dto";

/** Nama kolom database sama dengan field DTO, jadi tidak perlu alias/mapping. */
const RETURNING = TASK_TYPE_COLUMNS.join(", ");

export class TaskTypeRepository {
  private get repository(): Repository<TaskType> {
    return OpenDataSource.getRepository(TaskType);
  }

  public findById(id: string): Promise<In_DTO_TaskType | undefined> {
    return this.selectColumns()
      .where("pt.id = :id", { id })
      .getRawOne<In_DTO_TaskType>();
  }

  public async findConflicts(
    { type_name, sort_order }: In_DTO_UpdateTaskType,
    exceptId?: string,
  ): Promise<In_DTO_TaskTypeConflict> {
    const sameName = "LOWER(pt.type_name) = LOWER(:type_name)";
    const sameOrder = "pt.sort_order = :sort_order";

    const builder = this.repository
      .createQueryBuilder("pt")
      .withDeleted()
      .select(`COALESCE(BOOL_OR(${sameName}), false)`, "name_taken")
      .addSelect(`COALESCE(BOOL_OR(${sameOrder}), false)`, "sort_order_taken")
      .where(`(${sameName} OR ${sameOrder})`, {
        type_name: type_name ?? null,
        sort_order: sort_order ?? null,
      });

    return (await (
      exceptId ? builder.andWhere("pt.id <> :exceptId", { exceptId }) : builder
    ).getRawOne<In_DTO_TaskTypeConflict>()) as In_DTO_TaskTypeConflict;
  }

  /** Tipe masih dipakai oleh Task aktif. */
  public isInUse(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(Task).existsBy({
      task_type_id: id,
    });
  }

  public async create(payload: Partial<TaskType>): Promise<In_DTO_TaskType> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(TaskType)
      .values(payload)
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_TaskType[])[0] as In_DTO_TaskType;
  }

  /** Update tipe aktif dan langsung mengembalikan barisnya (satu query). */
  public async update(
    id: string,
    patch: Partial<TaskType>,
  ): Promise<In_DTO_TaskType | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update()
      .set(patch)
      .where("id = :id AND deleted_at IS NULL", { id })
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_TaskType[])[0] ?? null;
  }

  public async softDelete(id: string, audit: T_Audit): Promise<boolean> {
    const { affected } = await this.repository.update(
      { id, deleted_at: IsNull() },
      audit,
    );
    return Boolean(affected);
  }

  /** Daftar tipe + total: 2 query paralel; nomor urut dihitung di database. */
  public async fetchPagination({
    page,
    limit,
    sort_by,
    order_by,
    search,
  }: In_DTO_TaskTypeListQuery) {
    const sortColumn = `pt.${sort_by}`;
    const [data, totalItems] = await Promise.all([
      this.applySearch(this.selectColumns(), search)
        .addSelect(
          `CAST(ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${order_by}, pt.id ASC) AS int)`,
          "no",
        )
        .orderBy(sortColumn, order_by)
        .addOrderBy("pt.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<In_DTO_TaskTypeListItem>(),
      this.applySearch(
        this.repository.createQueryBuilder("pt"),
        search,
      ).getCount(),
    ]);
    return toPaginationResult(data, page, limit, totalItems);
  }

  private selectColumns(): SelectQueryBuilder<TaskType> {
    return this.repository
      .createQueryBuilder("pt")
      .select("pt.id", "id")
      .addSelect("pt.type_name", "type_name")
      .addSelect("pt.sort_order", "sort_order")
      .addSelect("pt.created_at", "created_at")
      .addSelect("pt.updated_at", "updated_at");
  }

  private applySearch(
    builder: SelectQueryBuilder<TaskType>,
    search: string,
  ): SelectQueryBuilder<TaskType> {
    return search
      ? builder.andWhere("pt.type_name ILIKE :search", {
          search: `%${escapeLike(search)}%`,
        })
      : builder;
  }
}

export const repository = new TaskTypeRepository();
