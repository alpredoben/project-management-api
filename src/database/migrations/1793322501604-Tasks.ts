import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { uuidPk, fk, uuidCol, auditColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class Tasks1793322501604 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASKS,
        columns: [
          uuidPk(),
          uuidCol("project_id"),
          uuidCol("task_type_id"),
          uuidCol("task_status_id"),
          { name: "title", type: "varchar", length: "255" },
          { name: "description", type: "text", isNullable: true },
          { name: "start_date", type: "date", isNullable: true }, // YYYY-MM-DD
          { name: "end_date", type: "date", isNullable: true },
          { name: "has_problem", type: "boolean", default: false },
          { name: "problem_message", type: "text", isNullable: true },
          uuidCol("user_pic_id"), // 1 PIC / leader
          ...auditColumns(),
        ],
        uniques: [
          { name: "uq_tasks_id_project", columnNames: ["id", "project_id"] },
        ], // target composite FK
        foreignKeys: [
          fk("fk_tasks_project", ["project_id"], "projects"),
          fk("fk_tasks_task_type", ["task_type_id"], "task_types"),
          fk("fk_tasks_task_status", ["task_status_id"], "task_status"),
          fk("fk_tasks_user_pic", ["user_pic_id"], "users"),
        ],
        checks: [
          {
            name: "ck_tasks_dates",
            expression:
              "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
          },
          {
            name: "ck_tasks_problem",
            expression: "has_problem = FALSE OR problem_message IS NOT NULL",
          },
        ],
        indices: [
          { name: "ix_tasks_project", columnNames: ["project_id"] },
          { name: "ix_tasks_status", columnNames: ["task_status_id"] },
          { name: "ix_tasks_pic", columnNames: ["user_pic_id"] },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASKS, true, true, true);
  }
}
