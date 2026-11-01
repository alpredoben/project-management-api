import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

/**
 * Menambahkan kolom `users.avatar` pada database yang sudah ter-migrasi
 * sebelum kolom tersebut ada di migration `Users`. Aman dijalankan ulang:
 * dilewati bila kolom sudah ada (database baru).
 */
export class UsersAvatar1793500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn(SCHEMA_NAMES.USERS, "avatar")) {
      return;
    }
    await queryRunner.addColumn(
      SCHEMA_NAMES.USERS,
      new TableColumn({
        name: "avatar",
        type: "text",
        isNullable: true,
        comment: "object path file avatar di MinIO storage",
      }),
    );
  }

  public async down(): Promise<void> {
    // Sengaja kosong: kolom `avatar` dimiliki oleh migration `Users`.
  }
}
