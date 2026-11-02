import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { auditColumns, lookupColumns, uuidPk } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class ProjectStatus1793293288121 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.PROJECT_STATUS,
        columns: lookupColumns("status_name", true),
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(SCHEMA_NAMES.PROJECT_STATUS, true, true, true);
  }
}
