import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { lookupColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class ProjectTypes1793293506394 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.PROJECT_TYPES,
        columns: lookupColumns("project_type_name"),
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.PROJECT_TYPES, true, true, true);
  }
}
