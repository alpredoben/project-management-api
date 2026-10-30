import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { lookupColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class MemberRoles1793293774122 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Pengganti members.member_role (teks bebas). Contoh: Developer, QA, Designer, ...
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.MEMBER_ROLES,
        columns: lookupColumns("member_role_name"),
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.MEMBER_ROLES, true, true, true);
  }
}
