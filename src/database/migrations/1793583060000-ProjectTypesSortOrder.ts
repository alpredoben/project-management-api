import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableUnique,
} from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

const SORT_ORDER_UNIQUE = "uq_project_types_sort_order";
const PROJECT_TYPE_INDEX = "ix_projects_type";

/**
 * Migration `ProjectTypes` membuat tabel tanpa kolom `sort_order`, sedangkan
 * entity `ProjectType` mewajibkannya (unik). Migration ini:
 *  - menambah `project_types.sort_order` (data lama diberi nomor urut berdasarkan
 *    waktu dibuat, supaya constraint unik tidak gagal), dan
 *  - menambah index `projects.project_type_id` (kolom FK ini dipakai untuk
 *    mengecek apakah tipe masih dipakai sebelum dihapus).
 * Aman dijalankan ulang: setiap langkah dilewati bila sudah ada.
 */
export class ProjectTypesSortOrder1793583060000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    if (!(await q.hasColumn(SCHEMA_NAMES.PROJECT_TYPES, "sort_order"))) {
      await q.addColumn(
        SCHEMA_NAMES.PROJECT_TYPES,
        new TableColumn({ name: "sort_order", type: "int", default: 0 }),
      );
      await q.query(`
        UPDATE ${SCHEMA_NAMES.PROJECT_TYPES} AS pt
           SET sort_order = ranked.rn
          FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
              FROM ${SCHEMA_NAMES.PROJECT_TYPES}
          ) AS ranked
         WHERE pt.id = ranked.id
      `);
      await q.createUniqueConstraint(
        SCHEMA_NAMES.PROJECT_TYPES,
        new TableUnique({
          name: SORT_ORDER_UNIQUE,
          columnNames: ["sort_order"],
        }),
      );
    }

    await q.query(`
      CREATE INDEX IF NOT EXISTS "${PROJECT_TYPE_INDEX}"
        ON ${SCHEMA_NAMES.PROJECTS} ("project_type_id")
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "${PROJECT_TYPE_INDEX}"`);
    if (await q.hasColumn(SCHEMA_NAMES.PROJECT_TYPES, "sort_order")) {
      await q.dropColumn(SCHEMA_NAMES.PROJECT_TYPES, "sort_order");
    }
  }
}
