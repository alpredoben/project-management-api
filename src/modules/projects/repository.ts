import { IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import {
  Project,
  ProjectStatus,
  ProjectType,
  Task,
  User,
} from "../../database/entities";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { escapeLike } from "../../shared/utils/sql.util";
import {
  In_DTO_Project,
  In_DTO_ProjectListItem,
  In_DTO_ProjectListQuery,
  PROJECT_COLUMNS,
  T_Audit,
} from "./dto";

const RETURNING = PROJECT_COLUMNS.join(", ");

export class ProjectRepository {
  private get repository(): Repository<Project> {
    return OpenDataSource.getRepository(Project);
  }

  public async findById(id: string): Promise<Project | null> {
    const result = await this.repository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: [
        "project_type",
        "project_status",
        "owner",
        "childrens",
        "parent",
      ],
      select: {
        id: true,
        project_name: true,
        project_code: true,
        description: true,
        project_type_id: true,
        project_status_id: true,
        owner_id: true,
        parent_id: true,
        max_contributors: true,
        start_date: true,
        end_date: true,
        project_type: {
          id: true,
          type_name: true,
        },
        project_status: {
          id: true,
          status_name: true,
        },
        owner: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        parent: {
          id: true,
          project_name: true,
          project_code: true,
          description: true,
        },
        childrens: {
          id: true,
          project_name: true,
          project_code: true,
          description: true,
        },
      },
    });

    return result;
  }

  public async findConflicts(
    projectCode: string | undefined,
    projectName: string | undefined,
    ownerId: string | null,
    exceptId?: string,
  ): Promise<{ code_taken: boolean; name_taken: boolean }> {
    const builder = this.repository
      .createQueryBuilder("p")
      .withDeleted()
      .select(
        "COALESCE(BOOL_OR(p.project_code = :projectCode), false)",
        "code_taken",
      )
      .addSelect(
        `COALESCE(BOOL_OR(
          p.deleted_at IS NULL
          AND p.owner_id = :ownerId
          AND LOWER(p.project_name) = LOWER(:projectName)
        ), false)`,
        "name_taken",
      )
      .where(
        "p.project_code = :projectCode OR (p.owner_id = :ownerId AND LOWER(p.project_name) = LOWER(:projectName))",
        { projectCode, projectName, ownerId },
      );

    return (await (
      exceptId ? builder.andWhere("p.id <> :exceptId", { exceptId }) : builder
    ).getRawOne<{ code_taken: boolean; name_taken: boolean }>()) as {
      code_taken: boolean;
      name_taken: boolean;
    };
  }

  public hasProjectType(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(ProjectType).existsBy({ id });
  }

  public hasProjectStatus(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(ProjectStatus).existsBy({ id });
  }

  public hasOwner(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(User).existsBy({ id });
  }

  public hasParent(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  public hasActiveChildren(id: string): Promise<boolean> {
    return this.repository.existsBy({ parent_id: id });
  }

  public hasTasks(id: string): Promise<boolean> {
    return OpenDataSource.getRepository(Task).existsBy({ project_id: id });
  }

  public async create(payload: Partial<Project>): Promise<In_DTO_Project> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(Project)
      .values(payload)
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_Project[])[0];
  }

  public async update(
    id: string,
    patch: Partial<Project>,
  ): Promise<In_DTO_Project | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update()
      .set(patch)
      .where("id = :id AND deleted_at IS NULL", { id })
      .returning(RETURNING)
      .execute();
    return (raw as In_DTO_Project[])[0] ?? null;
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
    project_type_id,
    project_status_id,
  }: In_DTO_ProjectListQuery) {
    const sortColumn = `p.${sort_by}`;

    // Buat query builder dengan filter dan tambahkan relasi yang dibutuhkan
    const queryBuilder = this.applyFilters(this.selectColumns(), {
      search,
      project_type_id,
      project_status_id,
    })
      .leftJoinAndSelect("p.project_type", "project_type")
      .leftJoinAndSelect("p.project_status", "project_status")
      .leftJoinAndSelect("p.owner", "owner")
      .leftJoinAndSelect("p.parent", "parent")
      .leftJoinAndSelect("p.childrens", "childrens");

    const [data, totalItems] = await Promise.all([
      queryBuilder
        .addSelect(
          `CAST(ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${order_by}, p.id ASC) AS int)`,
          "no",
        )
        .orderBy(sortColumn, order_by)
        .addOrderBy("p.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<In_DTO_ProjectListItem>(),

      this.applyFilters(this.repository.createQueryBuilder("p"), {
        search,
        project_type_id,
        project_status_id,
      }).getCount(),
    ]);

    return toPaginationResult(data, page, limit, totalItems);
  }

  private selectColumns(): SelectQueryBuilder<Project> {
    return this.repository
      .createQueryBuilder("p")
      .select("p.id", "id")
      .addSelect("p.project_type_id", "project_type_id")
      .addSelect("p.project_status_id", "project_status_id")
      .addSelect("p.project_code", "project_code")
      .addSelect("p.project_name", "project_name")
      .addSelect("p.description", "description")
      .addSelect("p.owner_id", "owner_id")
      .addSelect("p.parent_id", "parent_id")
      .addSelect("p.max_contributors", "max_contributors")
      .addSelect("p.start_date", "start_date")
      .addSelect("p.end_date", "end_date")
      .addSelect("p.created_at", "created_at")
      .addSelect("p.updated_at", "updated_at");
  }

  private applyFilters(
    builder: SelectQueryBuilder<Project>,
    {
      search,
      project_type_id,
      project_status_id,
    }: Pick<
      In_DTO_ProjectListQuery,
      "search" | "project_type_id" | "project_status_id"
    >,
  ): SelectQueryBuilder<Project> {
    if (search) {
      builder.andWhere(
        "(p.project_code ILIKE :search OR p.project_name ILIKE :search OR p.description ILIKE :search)",
        { search: `%${escapeLike(search)}%` },
      );
    }
    if (project_type_id) {
      builder.andWhere("p.project_type_id = :project_type_id", {
        project_type_id,
      });
    }
    if (project_status_id) {
      builder.andWhere("p.project_status_id = :project_status_id", {
        project_status_id,
      });
    }
    return builder;
  }
}

export const repository = new ProjectRepository();
