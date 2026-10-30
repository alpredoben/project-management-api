import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { lookupColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class MemberTypes1793293660412 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Contoh nilai: Internal, Vendor, Client, ...
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.MEMBER_TYPES,
        columns: lookupColumns("member_type_name"),
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.MEMBER_TYPES, true, true, true);
  }
}
