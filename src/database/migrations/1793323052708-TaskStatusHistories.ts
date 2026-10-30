import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { fk, uuidCol, uuidPk } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskStatusHistories1793323052708 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_STATUS_HISTORIES,
        columns: [
          uuidPk(),
          uuidCol("task_id"),
          uuidCol("from_status_id", true),
          uuidCol("to_status_id"),
          uuidCol("changed_by"),
          { name: "notes", type: "text", isNullable: true },
          {
            name: "changed_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          fk(
            "fk_task_status_hist_task",
            ["task_id"],
            SCHEMA_NAMES.TASKS,
            ["id"],
            "CASCADE",
          ),
          fk(
            "fk_task_status_hist_from",
            ["from_status_id"],
            SCHEMA_NAMES.TASK_STATUS,
          ),
          fk(
            "fk_task_status_hist_to",
            ["to_status_id"],
            SCHEMA_NAMES.TASK_STATUS,
          ),
          fk("fk_task_status_hist_user", ["changed_by"], SCHEMA_NAMES.USERS),
        ],
        indices: [
          {
            name: "ix_task_status_hist_task",
            columnNames: ["task_id", "changed_at"],
          },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    // [PERBAIKAN] Mengganti string mentah dengan SCHEMA_NAMES
    await q.dropTable(SCHEMA_NAMES.TASK_STATUS_HISTORIES, true, true, true);
  }
}
