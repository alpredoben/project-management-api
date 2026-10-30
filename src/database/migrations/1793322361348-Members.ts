import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { uuidPk, fk, uuidCol, auditColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class Members1793322361348 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Keanggotaan user di sebuah project
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.MEMBERS,
        columns: [
          uuidPk(),
          uuidCol("project_id"),
          uuidCol("user_id"),
          uuidCol("member_type_id"),
          uuidCol("member_role_id"),
          ...auditColumns(),
        ],
        uniques: [
          {
            name: "uq_members_project_user",
            columnNames: ["project_id", "user_id"],
          },
          { name: "uq_members_id_project", columnNames: ["id", "project_id"] },
        ],
        foreignKeys: [
          fk("fk_members_project", ["project_id"], "projects"),
          fk("fk_members_user", ["user_id"], "users"),
          fk("fk_members_member_type", ["member_type_id"], "member_types"),
          fk("fk_members_member_role", ["member_role_id"], "member_roles"),
        ],
        indices: [{ name: "ix_members_user", columnNames: ["user_id"] }],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.MEMBERS, true, true, true);
  }
}
