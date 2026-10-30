import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { uuidPk, fk, uuidCol, auditColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskMembers1793322594224 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Penugasan: 1 task banyak member, 1 member banyak task
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_MEMBERS,
        columns: [
          uuidPk(),
          uuidCol("task_id"),
          uuidCol("member_id"),
          { name: "is_pic", type: "boolean", default: false },
          { name: "notes", type: "text", isNullable: true },
          ...auditColumns(),
        ],
        uniques: [
          { name: "uq_task_members", columnNames: ["task_id", "member_id"] },
        ],
        foreignKeys: [
          fk(
            "fk_task_members_task",
            ["task_id"],
            SCHEMA_NAMES.TASKS,
            ["id"],
            "CASCADE",
          ),
          fk("fk_task_members_member", ["member_id"], SCHEMA_NAMES.USERS, [
            "id",
          ]),
        ],
        indices: [
          { name: "ix_task_members_member", columnNames: ["member_id"] },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_MEMBERS, true, true, true);
  }
}
