import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { auditColumns, fk, uuidCol, uuidPk } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class Projects1793322187625 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.PROJECTS,
        columns: [
          uuidPk(),
          uuidCol("project_type_id"),
          uuidCol("project_status_id"),
          {
            name: "project_code",
            type: "varchar",
            length: "50",
            isUnique: true,
          },
          { name: "project_name", type: "varchar", length: "200" },
          { name: "description", type: "text", isNullable: true },
          uuidCol("owner_id", true),
          uuidCol("parent_id", true),
          { name: "max_contributors", type: "int", default: 0 },
          { name: "start_date", type: "date", isNullable: true },
          { name: "end_date", type: "date", isNullable: true },
          ...auditColumns(),
        ],
        foreignKeys: [
          fk(
            "fk_projects_project_type",
            ["project_type_id"],
            SCHEMA_NAMES.PROJECT_TYPES,
          ),
          fk(
            "fk_projects_project_status",
            ["project_status_id"],
            SCHEMA_NAMES.PROJECT_STATUS,
          ),
          fk("fk_projects_owner", ["owner_id"], SCHEMA_NAMES.USERS),
          fk(
            "fk_projects_parent",
            ["parent_id"],
            SCHEMA_NAMES.PROJECTS,
            ["id"],
            "RESTRICT",
          ),
        ],
        indices: [
          { name: "ix_projects_parent", columnNames: ["parent_id"] },
          { name: "ix_projects_owner", columnNames: ["owner_id"] },
          { name: "ix_projects_status", columnNames: ["project_status_id"] },
        ],
      }),
      true,
    );

    await q.query(`
      CREATE UNIQUE INDEX "uq_projects_owner_name"
        ON ${SCHEMA_NAMES.PROJECTS} ("owner_id", lower("project_name"))
        WHERE "deleted_at" IS NULL
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "uq_projects_owner_name"`);
    await q.dropTable(SCHEMA_NAMES.PROJECTS, true, true, true);
  }
}
