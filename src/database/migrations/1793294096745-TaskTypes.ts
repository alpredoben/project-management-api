import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { lookupColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskTypes1793294096745 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_TYPES,
        columns: lookupColumns("type_name", true),
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_TYPES, true, true, true);
  }
}
