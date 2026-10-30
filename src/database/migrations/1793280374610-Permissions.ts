import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class Permissions1793280374610 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.PERMISSIONS,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "name", // Contoh: 'Read', 'Create'
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "slug", // Contoh: 'menu.read', 'menu.create'
            type: "varchar",
            length: "100",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "created_by",
            type: "varchar",
            length: "200",
            isNullable: true,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_by",
            type: "varchar",
            length: "200",
            isNullable: true,
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "deleted_by",
            type: "varchar",
            length: "200",
            isNullable: true,
          },
        ],
      }),
      true, // ifNotExists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(SCHEMA_NAMES.PERMISSIONS, true);
  }
}
