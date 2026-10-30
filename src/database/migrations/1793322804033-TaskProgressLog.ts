import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { auditColumns, fk, uuidCol, uuidPk } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskProgressLog1793322804033 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Deskripsi pekerjaan yang sudah dan akan dikerjakan
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_PROGRESS_LOGS,
        columns: [
          uuidPk(),
          uuidCol("task_id"),
          uuidCol("member_id"),
          { name: "log_date", type: "date", default: "CURRENT_DATE" },
          { name: "done_description", type: "text", isNullable: true }, // yang sudah dikerjakan
          { name: "planned_description", type: "text", isNullable: true }, // yang akan dikerjakan
          { name: "progress_percent", type: "smallint", isNullable: true },
          ...auditColumns(),
        ],
        uniques: [
          {
            name: "uq_task_progress_logs_id_task",
            columnNames: ["id", "task_id"],
          },
        ],
        checks: [
          {
            name: "ck_task_progress_logs_content",
            expression:
              "done_description IS NOT NULL OR planned_description IS NOT NULL",
          },
          {
            name: "ck_task_progress_logs_percent",
            expression:
              "progress_percent IS NULL OR progress_percent BETWEEN 0 AND 100",
          },
        ],
        foreignKeys: [
          fk(
            "fk_task_progress_logs_assignee",
            ["task_id", "member_id"],
            "task_members",
            ["task_id", "member_id"],
            "CASCADE",
          ),
        ],
        indices: [
          {
            name: "ix_task_progress_task",
            columnNames: ["task_id", "log_date"],
          },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_PROGRESS_LOGS, true, true, true);
  }
}
