import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class Users1793280752456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.USERS,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "phone",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            comment: "apakah user ini aktif (bisa login) atau tidak",
          },
          {
            name: "is_login",
            type: "boolean",
            default: false,
            comment: "apakah user ini sedang login atau tidak",
          },
          {
            name: "refresh_token",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "avatar",
            type: "text",
            isNullable: true,
          },
          {
            name: "last_login_at",
            type: "timestamp",
            default: null,
            isNullable: true,
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
    await queryRunner.dropTable(SCHEMA_NAMES.USERS, true);
  }
}
