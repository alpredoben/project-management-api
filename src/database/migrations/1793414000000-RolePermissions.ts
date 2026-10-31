import { randomUUID } from "crypto";
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class RolePermissions1793414000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: SCHEMA_NAMES.ROLE_PERMISSIONS,
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
            name: `UQ_${SCHEMA_NAMES.ROLE_PERMISSIONS}_role_permission`,
            columnNames: ["role_id", "permission_id"],
          },
        ],
        foreignKeys: [
          {
            name: `FK_${SCHEMA_NAMES.ROLE_PERMISSIONS}_role_id`,
            columnNames: ["role_id"],
            referencedTableName: SCHEMA_NAMES.ROLES,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: `FK_${SCHEMA_NAMES.ROLE_PERMISSIONS}_permission_id`,
            columnNames: ["permission_id"],
            referencedTableName: SCHEMA_NAMES.PERMISSIONS,
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    const existingAssignments: {
      role_id: string;
      permission_id: string;
      is_active: number | string;
    }[] = await queryRunner.query(
      `SELECT role_id, permission_id, MAX(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) AS is_active
       FROM ${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}
       GROUP BY role_id, permission_id`,
    );

    if (existingAssignments.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(SCHEMA_NAMES.ROLE_PERMISSIONS)
        .values(
          existingAssignments.map((assignment) => ({
            id: randomUUID(),
            role_id: assignment.role_id,
            permission_id: assignment.permission_id,
            deleted_at: Number(assignment.is_active) === 1 ? null : new Date(),
          })),
        )
        .execute();
    }

    const roleMenuPermissions = await queryRunner.getTable(
      SCHEMA_NAMES.ROLE_MENU_PERMISSIONS,
    );
    if (!roleMenuPermissions) {
      throw new Error(
        `Required table ${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS} was not found.`,
      );
    }

    await queryRunner.createForeignKey(
      roleMenuPermissions,
      new TableForeignKey({
        name: `FK_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_role_permission`,
        columnNames: ["role_id", "permission_id"],
        referencedTableName: SCHEMA_NAMES.ROLE_PERMISSIONS,
        referencedColumnNames: ["role_id", "permission_id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roleMenuPermissions = await queryRunner.getTable(
      SCHEMA_NAMES.ROLE_MENU_PERMISSIONS,
    );
    const rolePermissionForeignKey = roleMenuPermissions?.foreignKeys.find(
      ({ name }) =>
        name ===
        `FK_${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS}_role_permission`,
    );
    if (roleMenuPermissions && rolePermissionForeignKey) {
      await queryRunner.dropForeignKey(
        roleMenuPermissions,
        rolePermissionForeignKey,
      );
    }
    await queryRunner.dropTable(SCHEMA_NAMES.ROLE_PERMISSIONS, true, true);
  }
}
