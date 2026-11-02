import { IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Project } from "../../database/entities/projects.entity";
import { ProjectStatus } from "../../database/entities/projectStatus.entity";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { escapeLike } from "../../shared/utils/sql.util";
import {
  In_DTO_ProjectStatus,
  In_DTO_ProjectStatusListItem,
  In_DTO_ProjectStatusListQuery,
  T_Audit,
  T_ProjectStatusSortField,
} from "./dto";

const SORT_COLUMNS: Record<T_ProjectStatusSortField, string> = {
  id: "ps.id",
  status_name: "ps.project_status_name",
  sort_order: "ps.sort_order",
  created_at: "ps.created_at",
  updated_at: "ps.updated_at",
};

const RETURNING =
  "id, project_status_name AS status_name, sort_order, created_at, updated_at";

export class ProjectStatusRepository {
  private get repository(): Repository<ProjectStatus> {
    return OpenDataSource.getRepository(ProjectStatus);
  }

  public findById(id: string): Promise<In_DTO_ProjectStatus | undefined> {
    return this.selectColumns()
      .where("ps.id = :id", { id })
      .getRawOne<In_DTO_ProjectStatus>();
  }

  /** Nama unik (tanpa membedakan huruf besar/kecil), termasuk yang sudah di-soft-delete. */
  public isNameTaken(name: string, exceptId?: string): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("ps")
      .withDeleted()
      .where("LOWER(ps.project_status_name) = LOWER(:name)", { name });
    return this.excluding(builder, exceptId).getExists();
  }

  public isSortOrderTaken(
    sortOrder: number,
    exceptId?: string,
  ): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("ps")
      .where("ps.sort_order = :sortOrder", { sortOrder });
    return this.excluding(builder, exceptId).getExists();
  }

  /** Status masih dipakai oleh project aktif. */
  public isInUse(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(Project).existsBy({
      project_status_id: id,
    });
  }

  public async create(
    payload: Partial<ProjectStatus>,
  ): Promise<In_DTO_ProjectStatus> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(ProjectStatus)
      .values(payload)
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_ProjectStatus[])[0];
  }

  /** Update status aktif dan langsung mengembalikan barisnya (satu query). */
  public async update(
    id: string,
    patch: Partial<ProjectStatus>,
  ): Promise<In_DTO_ProjectStatus | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update()
      .set(patch)
      .where("id = :id AND deleted_at IS NULL", { id })
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_ProjectStatus[])[0] ?? null;
  }

  public async softDelete(id: string, audit: T_Audit): Promise<boolean> {
    const { affected } = await this.repository.update(
      { id, deleted_at: IsNull() },
      audit,
    );
    return Boolean(affected);
  }

  /** Daftar status + total: 2 query paralel; nomor urut dihitung di database. */
  public async fetchPagination({
    page,
    limit,
    sort_by,
    order_by,
    search,
  }: In_DTO_ProjectStatusListQuery) {
    const sortColumn = SORT_COLUMNS[sort_by];
    const [data, totalItems] = await Promise.all([
      this.applySearch(this.selectColumns(), search)
        .addSelect(
          `CAST(ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${order_by}, ps.id ASC) AS int)`,
          "no",
        )
        .orderBy(sortColumn, order_by)
        .addOrderBy("ps.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<In_DTO_ProjectStatusListItem>(),
      this.applySearch(
        this.repository.createQueryBuilder("ps"),
        search,
      ).getCount(),
    ]);
    return toPaginationResult(data, page, limit, totalItems);
  }

  private selectColumns(): SelectQueryBuilder<ProjectStatus> {
    return this.repository
      .createQueryBuilder("ps")
      .select("ps.id", "id")
      .addSelect("ps.project_status_name", "status_name")
      .addSelect("ps.sort_order", "sort_order")
      .addSelect("ps.created_at", "created_at")
      .addSelect("ps.updated_at", "updated_at");
  }

  private excluding(
    builder: SelectQueryBuilder<ProjectStatus>,
    exceptId?: string,
  ): SelectQueryBuilder<ProjectStatus> {
    return exceptId
      ? builder.andWhere("ps.id <> :exceptId", { exceptId })
      : builder;
  }

  private applySearch(
    builder: SelectQueryBuilder<ProjectStatus>,
    search: string,
  ): SelectQueryBuilder<ProjectStatus> {
    return search
      ? builder.andWhere("ps.project_status_name ILIKE :search", {
          search: `%${escapeLike(search)}%`,
        })
      : builder;
  }
}

export const repository = new ProjectStatusRepository();
