import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { uuidPk, fk, uuidCol, auditColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskComments1793322702428 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Komentar, catatan, saran, dan balasan (threaded)
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_COMMENTS,
        columns: [
          uuidPk(),
          uuidCol("task_id"),
          uuidCol("member_id"),
          uuidCol("parent_comment_id", true), // NULL = komentar utama, terisi = balasan
          {
            name: "comment_type",
            type: "varchar",
            length: "20",
            default: "'comment'",
          },
          { name: "content", type: "text" },
          ...auditColumns(),
        ],
        uniques: [
          { name: "uq_task_comments_id_task", columnNames: ["id", "task_id"] },
        ],
        checks: [
          {
            name: "ck_task_comments_type",
            expression: "comment_type IN ('comment', 'note', 'suggestion')",
          },
        ],
        foreignKeys: [
          // Hanya member yang di-assign ke task ini yang boleh berkomentar
          fk(
            "fk_task_comments_assignee",
            ["task_id", "member_id"],
            "task_members",
            ["task_id", "member_id"],
            "CASCADE",
          ),
          // Balasan wajib berada di task yang sama dengan komentar induknya
          fk(
            "fk_task_comments_parent",
            ["parent_comment_id", "task_id"],
            "task_comments",
            ["id", "task_id"],
            "CASCADE",
          ),
        ],
        indices: [
          {
            name: "ix_task_comments_task",
            columnNames: ["task_id", "created_at"],
          },
          {
            name: "ix_task_comments_parent",
            columnNames: ["parent_comment_id"],
          },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_COMMENTS, true, true, true);
  }
}
