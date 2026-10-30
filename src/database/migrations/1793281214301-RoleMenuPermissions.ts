import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class RoleMenuPermissions1793281214301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.ROLE_MENU_PERMISSIONS,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "role_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "menu_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "permission_id",
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
        uniques: [
          {
            name: `UQ_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_role_menu_permission`,
            columnNames: ["role_id", "menu_id", "permission_id"],
          },
        ],
        foreignKeys: [
          {
            name: `FK_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_role_id`,
            columnNames: ["role_id"],
            referencedTableName: SCHEMA_NAMES.ROLES,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: `FK_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_menu_id`,
            columnNames: ["menu_id"],
            referencedTableName: SCHEMA_NAMES.MENUS,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: `FK_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_permission_id`,
            columnNames: ["permission_id"],
            referencedTableName: SCHEMA_NAMES.PERMISSIONS,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(SCHEMA_NAMES.ROLE_MENU_PERMISSIONS, true, true);
  }
}
