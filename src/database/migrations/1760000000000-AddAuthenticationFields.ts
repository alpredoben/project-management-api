import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthenticationFields1760000000000
  implements MigrationInterface
{
  name = "AddAuthenticationFields1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "nip" VARCHAR(50),
        ADD COLUMN "is_email_verified" BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN "email_verification_token_hash" VARCHAR(64),
        ADD COLUMN "email_verification_expires_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN "password_reset_token_hash" VARCHAR(64),
        ADD COLUMN "password_reset_expires_at" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN "refresh_token_hash" VARCHAR(64),
        ADD COLUMN "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_users_nip_unique" ON "users" ("nip") WHERE "nip" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email_verification_token_hash" ON "users" ("email_verification_token_hash") WHERE "email_verification_token_hash" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_password_reset_token_hash" ON "users" ("password_reset_token_hash") WHERE "password_reset_token_hash" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_users_password_reset_token_hash"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_users_email_verification_token_hash"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_nip_unique"`);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "refresh_token_expires_at",
        DROP COLUMN "refresh_token_hash",
        DROP COLUMN "password_reset_expires_at",
        DROP COLUMN "password_reset_token_hash",
        DROP COLUMN "email_verification_expires_at",
        DROP COLUMN "email_verification_token_hash",
        DROP COLUMN "is_email_verified",
        DROP COLUMN "nip"
    `);
  }
}
