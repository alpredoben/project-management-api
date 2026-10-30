import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class UserRoles1793280940230 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.USER_ROLES,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "role_id",
            type: "uuid",
            isNullable: false,
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
        foreignKeys: [
          {
            name: `FK_${SCHEMA_NAMES.USER_ROLES}_user_id`,
            columnNames: ["user_id"],
            referencedTableName: SCHEMA_NAMES.USERS,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: `FK_${SCHEMA_NAMES.USER_ROLES}_role_id`,
            columnNames: ["role_id"],
            referencedTableName: SCHEMA_NAMES.ROLES,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true, // ifNotExists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(SCHEMA_NAMES.USER_ROLES, true, true);
  }
}
