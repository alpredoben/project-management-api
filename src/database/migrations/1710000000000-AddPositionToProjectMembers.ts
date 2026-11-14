import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionToProjectMembers1710000000000
  implements MigrationInterface
{
  name = "AddPositionToProjectMembers1710000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("project_members", "position_id"))) {
      await queryRunner.query(`
        ALTER TABLE "project_members"
        ADD COLUMN "position_id" UUID
        REFERENCES "positions"("id") ON DELETE SET NULL
      `);
    }

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_project_members_position_id"
      ON "project_members"("position_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("project_members", "position_id")) {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "idx_project_members_position_id"`,
      );
      await queryRunner.query(`
        ALTER TABLE "project_members"
        DROP COLUMN "position_id"
      `);
    }
  }
}
