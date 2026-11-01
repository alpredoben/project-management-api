import { In, IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Role } from "../../database/entities/role.entity";
import { User } from "../../database/entities/user.entity";
import { UserRole } from "../../database/entities/userRole.entity";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { generatePaginationMeta } from "../../shared/utils/pagination.util";
import {
  In_DTO_UserExportRow,
  In_DTO_UserListItem,
  In_DTO_UserListQuery,
  In_DTO_UserListResult,
  In_DTO_UserRecord,
  T_Audit,
  T_UserSortField,
} from "./dto";

const SORT_COLUMNS: Record<T_UserSortField, string> = {
  id: "u.id",
  name: "u.name",
  email: "u.email",
  phone: "u.phone",
  is_active: "u.is_active",
  created_at: "u.created_at",
  updated_at: "u.updated_at",
};

/**
 * Fragmen SQL: role user diagregasi di database (sub-query berkorelasi),
 * sehingga tidak perlu query tambahan maupun pengelompokan manual di aplikasi.
 */
const USER_ROLES_FROM = `
  FROM ${SCHEMA_NAMES.USER_ROLES} ur
  INNER JOIN ${SCHEMA_NAMES.ROLES} r ON r.id = ur.role_id AND r.deleted_at IS NULL
  WHERE ur.user_id = u.id AND ur.deleted_at IS NULL`;

const ROLES_JSON = `COALESCE((
  SELECT json_agg(json_build_object('id', r.id, 'name', r.name, 'slug', r.slug) ORDER BY r.name)
  ${USER_ROLES_FROM}), CAST('[]' AS json))`;

const ROLES_TEXT = `COALESCE((
  SELECT string_agg(r.name, ', ' ORDER BY r.name)
  ${USER_ROLES_FROM}), '')`;

const STATUS = `CASE WHEN u.is_active THEN 'active' ELSE 'not active' END`;

/** Mencegah formula injection di spreadsheet: awalan `= + - @` diberi tanda kutip. */
const safeSpreadsheetText = (expression: string): string =>
  `regexp_replace(COALESCE(${expression}, ''), '^([=+@-])', '''\\1')`;

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, "\\$&");

export class UserRepository {
  private get repository(): Repository<User> {
    return OpenDataSource.getRepository(User);
  }

  public findDetailById(id: string): Promise<In_DTO_UserRecord | undefined> {
    return this.listColumns()
      .addSelect("u.avatar", "avatar")
      .where("u.id = :id", { id })
      .getRawOne<In_DTO_UserRecord>();
  }

  public findAvatar(id: string): Promise<Pick<User, "avatar"> | null> {
    return this.repository.findOne({
      select: { avatar: true },
      where: { id },
    });
  }

  public exists(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  /** Email unik termasuk milik user yang sudah di-soft-delete. */
  public isEmailTaken(email: string, exceptId?: string): Promise<boolean> {
    const builder = this.repository
      .createQueryBuilder("u")
      .withDeleted()
      .where("LOWER(u.email) = :email", { email: email.toLowerCase() });
    if (exceptId) {
      builder.andWhere("u.id <> :exceptId", { exceptId });
    }
    return builder.getExists();
  }

  public countRolesByIds(ids: string[]): Promise<number> {
    return OpenDataSource.getRepository(Role).countBy({ id: In(ids) });
  }

  public createWithRoles(
    payload: Partial<User>,
    roleIds: string[],
    audit: T_Audit,
  ): Promise<string> {
    return OpenDataSource.transaction(async (manager) => {
      const { id } = await manager.save(User, payload);
      if (roleIds.length > 0) {
        await manager.insert(
          UserRole,
          roleIds.map((role_id) => ({ user_id: id, role_id, ...audit })),
        );
      }
      return id;
    });
  }

  /** Update user aktif (belum di-soft-delete); `false` bila user tidak ditemukan. */
  public async update(id: string, patch: Partial<User>): Promise<boolean> {
    const { affected } = await this.repository.update(
      { id, deleted_at: IsNull() },
      patch,
    );
    return Boolean(affected);
  }

  /** Soft-delete user beserta relasi role-nya dalam satu transaksi. */
  public softDelete(id: string, patch: Partial<User>): Promise<boolean> {
    return OpenDataSource.transaction(async (manager) => {
      const { affected } = await manager
        .getRepository(User)
        .update({ id, deleted_at: IsNull() }, patch);
      if (!affected) {
        return false;
      }
      await manager
        .getRepository(UserRole)
        .update(
          { user_id: id, deleted_at: IsNull() },
          { deleted_at: patch.deleted_at, deleted_by: patch.deleted_by },
        );
      return true;
    });
  }

  /**
   * Menambahkan role dalam satu statement atomik:
   * role yang pernah di-soft-delete dipulihkan, role yang belum ada di-insert,
   * dan role yang sudah aktif dilewati.
   */
  public async addRoles(
    userId: string,
    roleIds: string[],
    audit: T_Audit,
  ): Promise<void> {
    await OpenDataSource.query(
      `WITH restored AS (
         UPDATE ${SCHEMA_NAMES.USER_ROLES}
            SET deleted_at = NULL, deleted_by = NULL, updated_at = $3, updated_by = $4
          WHERE user_id = $1 AND role_id = ANY($2::uuid[]) AND deleted_at IS NOT NULL
       )
       INSERT INTO ${SCHEMA_NAMES.USER_ROLES}
         (id, user_id, role_id, created_at, created_by, updated_at, updated_by)
       SELECT gen_random_uuid(), $1::uuid, wanted.role_id, $3, $4, $3, $4
         FROM unnest($2::uuid[]) AS wanted(role_id)
        WHERE NOT EXISTS (
          SELECT 1 FROM ${SCHEMA_NAMES.USER_ROLES} ur
           WHERE ur.user_id = $1::uuid AND ur.role_id = wanted.role_id
        )`,
      [userId, roleIds, audit.updated_at, audit.updated_by ?? null],
    );
  }

  /** Daftar user + total: 2 query paralel, tanpa N+1 dan tanpa loop di aplikasi. */
  public async fetchPagination(
    query: In_DTO_UserListQuery,
  ): Promise<In_DTO_UserListResult> {
    const { page, limit, sort_by, order_by, search } = query;
    const sortColumn = SORT_COLUMNS[sort_by];

    const [data, totalItems] = await Promise.all([
      this.applySearch(this.listColumns(), search)
        .addSelect(this.rowNumber(query), "no")
        .orderBy(sortColumn, order_by)
        .addOrderBy("u.id", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<In_DTO_UserListItem>(),
      this.applySearch(
        this.repository.createQueryBuilder("u"),
        search,
      ).getCount(),
    ]);

    return {
      data,
      meta: {
        pagination: generatePaginationMeta(page, limit, totalItems),
        total_rows: totalItems,
      },
    };
  }

  /** Seluruh user sesuai filter/sort (tanpa paginasi) untuk export. */
  public exportAll(
    query: In_DTO_UserListQuery,
  ): Promise<In_DTO_UserExportRow[]> {
    return this.applySearch(
      this.repository.createQueryBuilder("u"),
      query.search,
    )
      .select(this.rowNumber(query), "no")
      .addSelect(safeSpreadsheetText("u.name"), "name")
      .addSelect(safeSpreadsheetText("u.email"), "email")
      .addSelect(safeSpreadsheetText("u.phone"), "phone")
      .addSelect(STATUS, "status")
      .addSelect(safeSpreadsheetText(ROLES_TEXT), "roles")
      .orderBy(SORT_COLUMNS[query.sort_by], query.order_by)
      .addOrderBy("u.id", "ASC")
      .getRawMany<In_DTO_UserExportRow>();
  }

  /** Kolom dasar yang dipakai bersama oleh detail dan list user. */
  private listColumns(): SelectQueryBuilder<User> {
    return this.repository
      .createQueryBuilder("u")
      .select("u.id", "id")
      .addSelect("u.name", "name")
      .addSelect("u.email", "email")
      .addSelect("u.phone", "phone")
      .addSelect("u.is_active", "is_active")
      .addSelect(STATUS, "status")
      .addSelect(ROLES_JSON, "roles")
      .addSelect("u.created_at", "created_at")
      .addSelect("u.updated_at", "updated_at");
  }

  /** Nomor urut dihitung di database agar konsisten dengan sort dan halaman. */
  private rowNumber({ sort_by, order_by }: In_DTO_UserListQuery): string {
    return `CAST(ROW_NUMBER() OVER (ORDER BY ${SORT_COLUMNS[sort_by]} ${order_by}, u.id ASC) AS int)`;
  }

  private applySearch(
    builder: SelectQueryBuilder<User>,
    search: string,
  ): SelectQueryBuilder<User> {
    if (search) {
      builder.andWhere(
        "(u.name ILIKE :search OR u.email ILIKE :search OR u.phone ILIKE :search)",
        { search: `%${escapeLike(search)}%` },
      );
    }
    return builder;
  }
}

export const repository = new UserRepository();
