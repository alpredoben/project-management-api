import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { auditColumns, fk, uuidCol, uuidPk } from "../migration-helper";

const TABLE = SCHEMA_NAMES.ATTACHMENT_FILES;

const PARENTS = [
  { type: "PROJECTS", table: "projects" },
  { type: "TASKS", table: "tasks" },
  { type: "COMMENTS", table: "task_comments" },
  { type: "PROGRESS_LOGS", table: "task_progress_logs" },
] as const;

const FN_CHECK_REF = "fn_attachment_files_check_reference";
const FN_BLOCK_DELETE = "fn_attachment_files_block_parent_delete";

export class Attachments1793323355885 implements MigrationInterface {
  name = "Attachments1793323355885";

  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: TABLE,
        columns: [
          uuidPk(),

          // ── Target lampiran (polymorphic) ────────────────────────────
          uuidCol("reference_id"),
          {
            name: "attachment_type",
            type: "varchar",
            length: "20",
            comment:
              "tabel induk dari reference_id: 'PROJECTS', 'TASKS', 'COMMENTS', 'PROGRESS_LOGS', 'AVATAR', 'OTHER'",
          },
          uuidCol("uploaded_by_user_id"),

          // ── Metadata file ────────────────────────────────────────────
          {
            name: "original_name",
            type: "varchar",
            length: "255",
            comment: "nama file asli dari user",
          },
          {
            name: "stored_name",
            type: "varchar",
            length: "255",
            comment: "nama file aman yang dipakai di storage (mis. uuid.ext)",
          },
          {
            name: "file_extension",
            type: "varchar",
            length: "20",
            isNullable: true,
            comment: "ekstensi file tanpa titik, misal 'jpg', 'pdf', 'docx'",
          },
          {
            name: "file_category",
            type: "varchar",
            length: "20",
            default: "'other'",
            comment:
              "'image', 'document', 'spreadsheet', 'presentation', 'video', 'audio', 'archive', 'other'",
          },
          {
            name: "mime_type",
            type: "varchar",
            length: "150",
            comment: "MIME type dari file",
          },
          {
            name: "file_size",
            type: "bigint",
            comment: "ukuran file dalam bytes",
          },
          {
            name: "checksum_sha256",
            type: "char",
            length: "64",
            comment:
              "checksum SHA256 (hex huruf kecil) untuk deteksi duplikat & integritas",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
            comment: "deskripsi file",
          },

          // ── Lokasi penyimpanan ───────────────────────────────────────
          {
            name: "storage_provider",
            type: "varchar",
            length: "20",
            default: "'local'",
            comment: "'local', 'minio', 'aws_s3', 'gcs', 'azure_blob'",
          },
          {
            name: "storage_bucket",
            type: "varchar",
            length: "200",
            isNullable: true,
            comment: "nama bucket untuk cloud/object storage",
          },
          {
            name: "storage_path",
            type: "text",
            comment: "path file di storage (maks 1000 karakter)",
          },
          {
            name: "thumbnail_path",
            type: "text",
            isNullable: true,
            comment: "path thumbnail file",
          },

          // ── Statistik unduhan ────────────────────────────────────────
          {
            name: "download_count",
            type: "int",
            default: 0,
            comment: "jumlah unduhan",
          },
          {
            name: "last_downloaded_at",
            type: "timestamp",
            isNullable: true,
            comment: "waktu unduhan terakhir",
          },

          ...auditColumns(),
        ],

        checks: [
          {
            name: "ck_attachment_files_type",
            expression:
              "attachment_type IN ('PROJECTS', 'TASKS', 'COMMENTS', 'PROGRESS_LOGS', 'AVATAR', 'OTHER')",
          },
          {
            name: "ck_attachment_files_category",
            expression:
              "file_category IN ('image', 'document', 'spreadsheet', 'presentation', 'video', 'audio', 'archive', 'pdf', 'other')",
          },
          {
            name: "ck_attachment_files_provider",
            expression:
              "storage_provider IN ('local', 'minio', 'aws_s3', 'gcs', 'azure_blob')",
          },
          { name: "ck_attachment_files_size", expression: "file_size > 0" },
          {
            name: "ck_attachment_files_checksum",
            expression: "checksum_sha256 ~ '^[0-9a-f]{64}$'",
          },
          {
            name: "ck_attachment_files_extension",
            expression:
              "file_extension IS NULL OR file_extension ~ '^[A-Za-z0-9]+$'",
          },
          // Menjaga index unik storage_path tetap aman (batas ukuran entri btree)
          {
            name: "ck_attachment_files_path_len",
            expression:
              "char_length(storage_path) BETWEEN 1 AND 1000 AND (thumbnail_path IS NULL OR char_length(thumbnail_path) <= 1000)",
          },
          {
            name: "ck_attachment_files_downloads",
            expression: "download_count >= 0",
          },
        ],

        foreignKeys: [
          {
            name: "fk_attachment_files_uploader",
            columnNames: ["uploaded_by_user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
          },
        ],

        indices: [
          // Satu objek fisik hanya boleh direferensikan oleh satu baris aktif
          {
            name: "uq_attachment_files_storage",
            columnNames: ["storage_provider", "storage_path"],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          },
          // Query utama: "semua lampiran milik X"
          {
            name: "ix_attachment_files_reference",
            columnNames: ["attachment_type", "reference_id"],
            where: '"deleted_at" IS NULL',
          },
          {
            name: "ix_attachment_files_uploader",
            columnNames: ["uploaded_by_user_id"],
          },
          {
            name: "ix_attachment_files_checksum",
            columnNames: ["reference_id", "checksum_sha256"],
            where: '"deleted_at" IS NULL',
          },
        ],
      }),
      true,
    );

    const checkBranches = PARENTS.map(
      (p) =>
        `WHEN '${p.type}' THEN PERFORM 1 FROM "${p.table}" WHERE "id" = NEW."reference_id" AND "deleted_at" IS NULL;`,
    ).join("\n        ");

    await q.query(`
      CREATE OR REPLACE FUNCTION ${FN_CHECK_REF}() RETURNS trigger AS $$
      BEGIN
        IF NEW."deleted_at" IS NOT NULL THEN
          RETURN NEW;
        END IF;
        CASE NEW."attachment_type"
        ${checkBranches}
        ELSE
          RETURN NEW;
        END CASE;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'attachment_files: reference_id % tidak ditemukan pada % (attachment_type)',
            NEW."reference_id", NEW."attachment_type"
            USING ERRCODE = '23503';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await q.query(`
      CREATE TRIGGER "trg_attachment_files_check_reference"
        BEFORE INSERT OR UPDATE OF "attachment_type", "reference_id", "deleted_at"
        ON "${TABLE}"
        FOR EACH ROW EXECUTE FUNCTION ${FN_CHECK_REF}()
    `);

    // 2) DELETE pada tabel induk: ditolak bila masih punya lampiran aktif (setara ON DELETE RESTRICT).
    const typeCases = PARENTS.map(
      (p) => `WHEN '${p.table}' THEN '${p.type}'`,
    ).join(" ");
    await q.query(`
      CREATE OR REPLACE FUNCTION ${FN_BLOCK_DELETE}() RETURNS trigger AS $$
      DECLARE
        v_type text := CASE TG_TABLE_NAME ${typeCases} END;
      BEGIN
        IF EXISTS (
          SELECT 1 FROM "${TABLE}"
          WHERE "attachment_type" = v_type
            AND "reference_id" = OLD."id"
            AND "deleted_at" IS NULL
        ) THEN
          RAISE EXCEPTION 'tidak bisa menghapus % (id=%): masih memiliki lampiran aktif', TG_TABLE_NAME, OLD."id"
            USING ERRCODE = '23503';
        END IF;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql
    `);
    for (const p of PARENTS) {
      await q.query(`
        CREATE TRIGGER "trg_${p.table}_block_delete_if_attached"
          BEFORE DELETE ON "${p.table}"
          FOR EACH ROW EXECUTE FUNCTION ${FN_BLOCK_DELETE}()
      `);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const p of PARENTS) {
      await q.query(
        `DROP TRIGGER IF EXISTS "trg_${p.table}_block_delete_if_attached" ON "${p.table}"`,
      );
    }
    await q.dropTable(TABLE, true, true, true); // trigger pada tabel ini ikut terhapus
    await q.query(`DROP FUNCTION IF EXISTS ${FN_BLOCK_DELETE}()`);
    await q.query(`DROP FUNCTION IF EXISTS ${FN_CHECK_REF}()`);
  }
}
