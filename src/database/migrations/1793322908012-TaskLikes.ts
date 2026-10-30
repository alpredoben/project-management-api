import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { fk, uuidCol, uuidPk } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskLikes1793322908012 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Like untuk komentar ATAU progress log (unlike = hapus baris)
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_LIKES,
        columns: [
          uuidPk(),
          uuidCol("task_id"),
          uuidCol("member_id"),
          uuidCol("comment_id", true),
          uuidCol("progress_log_id", true),
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        checks: [
          {
            name: "ck_task_likes_one_target",
            expression: "num_nonnulls(comment_id, progress_log_id) = 1",
          },
        ],
        foreignKeys: [
          fk(
            "fk_task_likes_assignee",
            ["task_id", "member_id"],
            "task_members",
            ["task_id", "member_id"],
            "CASCADE",
          ),
          fk(
            "fk_task_likes_comment",
            ["comment_id", "task_id"],
            "task_comments",
            ["id", "task_id"],
            "CASCADE",
          ),
          fk(
            "fk_task_likes_progress",
            ["progress_log_id", "task_id"],
            "task_progress_logs",
            ["id", "task_id"],
            "CASCADE",
          ),
        ],
        indices: [
          {
            name: "uq_task_likes_comment",
            columnNames: ["member_id", "comment_id"],
            isUnique: true,
            where: '"comment_id" IS NOT NULL',
          },
          {
            name: "uq_task_likes_progress",
            columnNames: ["member_id", "progress_log_id"],
            isUnique: true,
            where: '"progress_log_id" IS NOT NULL',
          },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_LIKES, true, true, true);
  }
}
