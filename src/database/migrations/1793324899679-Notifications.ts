import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { auditColumns, uuidCol, uuidPk } from "../migration-helper";

const TABLE = SCHEMA_NAMES.NOTIFICATIONS;

/**
 * Nilai target_name → tabel induk yang dirujuk target_reference_id.
 * (sama dengan attachment_type pada attachment_files)
 */
const TARGETS = [
  { name: "PROJECTS", table: "projects" },
  { name: "TASKS", table: "tasks" },
  { name: "COMMENTS", table: "task_comments" },
  { name: "PROGRESS_LOGS", table: "task_progress_logs" },
] as const;

const FN_CHECK_TARGET = "fn_notifications_check_target";
const FN_CASCADE_TARGET = "fn_notifications_cascade_target_delete";

export class Notifications1793324899679 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: TABLE,
        columns: [
          uuidPk(),

          // ── Pengirim & penerima ──────────────────────────────────────
          {
            ...uuidCol("sender_user_id", true),
            comment: "user pengirim; NULL = sistem / user sudah dihapus",
          },
          {
            ...uuidCol("recipient_user_id"),
            comment: "user penerima notifikasi (wajib)",
          },

          // ── Jenis & prioritas ────────────────────────────────────────
          {
            name: "notification_type",
            type: "varchar",
            length: "100",
            comment:
              "TASK_ASSIGNED, TASK_UNASSIGNED, TASK_STATUS_CHANGED, TASK_PROBLEM_REPORTED, TASK_DUE_SOON, TASK_OVERDUE, COMMENT_ADDED, COMMENT_REPLIED, COMMENT_LIKED, MENTIONED, ATTACHMENT_ADDED, PROJECT_MEMBER_ADDED, PROJECT_MEMBER_REMOVED, SYSTEM",
          },
          {
            name: "priority",
            type: "varchar",
            length: "10",
            default: "'NORMAL'",
            comment: "'LOW', 'NORMAL', 'HIGH', 'URGENT'",
          },

          // ── Isi ──────────────────────────────────────────────────────
          {
            name: "title",
            type: "varchar",
            length: "200",
            comment: "judul singkat notifikasi",
          },
          {
            name: "message",
            type: "text",
            isNullable: true,
            comment: "isi lengkap notifikasi",
          },
          {
            name: "action_url",
            type: "text",
            isNullable: true,
            comment:
              "tujuan saat notifikasi diklik: path relatif (/...) atau http(s):// (maks 2000 karakter)",
          },
          {
            name: "data",
            type: "jsonb",
            default: "'{}'::jsonb",
            comment: "payload tambahan (object JSON) untuk kebutuhan client",
          },

          // ── Target (polymorphic) ─────────────────────────────────────
          {
            name: "target_name",
            type: "varchar",
            length: "30",
            isNullable: true,
            comment:
              "tabel induk target: 'PROJECTS', 'TASKS', 'COMMENTS', 'PROGRESS_LOGS'; NULL = tanpa target (mis. SYSTEM)",
          },
          {
            ...uuidCol("target_reference_id", true),
            comment: "id baris target; wajib terisi bersama target_name",
          },

          // ── Idempotensi ──────────────────────────────────────────────
          {
            name: "dedup_key",
            type: "varchar",
            length: "200",
            isNullable: true,
            comment:
              "kunci anti-duplikat per penerima, mis. 'TASK_DUE_SOON:<task_id>:2026-11-01'",
          },

          // ── Status & waktu ───────────────────────────────────────────
          {
            name: "notif_status",
            type: "varchar",
            length: "20",
            default: "'PENDING'",
            comment:
              "'PENDING', 'SENT', 'FAILED', 'READ', 'ARCHIVED' — konsisten dengan sent_at / read_at / archived_at",
          },
          {
            name: "sent_at",
            type: "timestamp",
            isNullable: true,
            comment: "waktu notifikasi terkirim",
          },
          {
            name: "read_at",
            type: "timestamp",
            isNullable: true,
            comment: "NULL = belum dibaca",
          },
          {
            name: "archived_at",
            type: "timestamp",
            isNullable: true,
            comment: "NULL = tidak diarsipkan",
          },
          {
            name: "expires_at",
            type: "timestamp",
            isNullable: true,
            comment: "setelah waktu ini boleh dibersihkan job retensi",
          },

          ...auditColumns(),
        ],

        checks: [
          {
            name: "ck_notifications_type",
            expression:
              "notification_type IN ('TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_STATUS_CHANGED', 'TASK_PROBLEM_REPORTED', 'TASK_DUE_SOON', 'TASK_OVERDUE', 'COMMENT_ADDED', 'COMMENT_REPLIED', 'COMMENT_LIKED', 'MENTIONED', 'ATTACHMENT_ADDED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'SYSTEM')",
          },
          {
            name: "ck_notifications_priority",
            expression: "priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')",
          },
          {
            name: "ck_notifications_title",
            expression: "char_length(btrim(title)) > 0",
          },
          {
            name: "ck_notifications_data",
            expression: "jsonb_typeof(data) = 'object'",
          },
          {
            name: "ck_notifications_action_url",
            expression:
              "action_url IS NULL OR (char_length(action_url) <= 2000 AND action_url ~ '^(/|https?://)')",
          },
          {
            name: "ck_notifications_not_self",
            expression:
              "sender_user_id IS NULL OR sender_user_id <> recipient_user_id",
          },

          // ── Target ───────────────────────────────────────────────────
          {
            name: "ck_notifications_target_name",
            expression:
              "target_name IS NULL OR target_name IN ('PROJECTS', 'TASKS', 'COMMENTS', 'PROGRESS_LOGS')",
          },

          // target_name & target_reference_id harus terisi berpasangan
          {
            name: "ck_notifications_target_pair",
            expression: "(target_name IS NULL) = (target_reference_id IS NULL)",
          },

          // Jenis notifikasi menentukan target yang wajib.
          // IS NOT DISTINCT FROM dipakai agar target NULL tidak lolos (CHECK meloloskan hasil NULL).
          {
            name: "ck_notifications_task_types",
            expression:
              "notification_type !~ '^TASK_' OR target_name IS NOT DISTINCT FROM 'TASKS'",
          },
          {
            name: "ck_notifications_comment_types",
            expression:
              "notification_type !~ '^COMMENT_' OR target_name IS NOT DISTINCT FROM 'COMMENTS'",
          },
          {
            name: "ck_notifications_project_types",
            expression:
              "notification_type !~ '^PROJECT_' OR target_name IS NOT DISTINCT FROM 'PROJECTS'",
          },

          // ── Status & waktu ───────────────────────────────────────────
          {
            name: "ck_notifications_status",
            expression:
              "notif_status IN ('PENDING', 'SENT', 'FAILED', 'READ', 'ARCHIVED')",
          },
          {
            name: "ck_notifications_status_lifecycle",
            expression:
              "(notif_status = 'PENDING' AND sent_at IS NULL AND read_at IS NULL AND archived_at IS NULL) OR (notif_status = 'FAILED' AND sent_at IS NULL AND read_at IS NULL AND archived_at IS NULL) OR (notif_status = 'SENT' AND sent_at IS NOT NULL AND read_at IS NULL AND archived_at IS NULL) OR (notif_status = 'READ' AND sent_at IS NOT NULL AND read_at IS NOT NULL AND archived_at IS NULL) OR (notif_status = 'ARCHIVED' AND sent_at IS NOT NULL AND archived_at IS NOT NULL)",
          },
          {
            name: "ck_notifications_times",
            expression:
              "(sent_at IS NULL OR sent_at >= created_at) AND (read_at IS NULL OR read_at >= created_at) AND (expires_at IS NULL OR expires_at > created_at)",
          },
        ],

        // Hanya FK ke users. Target (polymorphic) dijaga trigger di bawah.
        foreignKeys: [
          {
            name: "fk_notifications_recipient",
            columnNames: ["recipient_user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE", // penerima dihapus → notifikasinya ikut hilang
          },
          {
            name: "fk_notifications_sender",
            columnNames: ["sender_user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL", // pengirim dihapus → notifikasi tetap ada
          },
        ],

        indices: [
          // Inbox: semua notifikasi aktif milik user
          {
            name: "ix_notifications_inbox",
            columnNames: ["recipient_user_id", "created_at"],
            where: '"deleted_at" IS NULL AND "archived_at" IS NULL',
          },
          // Badge / daftar belum dibaca
          {
            name: "ix_notifications_unread",
            columnNames: ["recipient_user_id", "created_at"],
            where:
              '"read_at" IS NULL AND "archived_at" IS NULL AND "deleted_at" IS NULL',
          },
          // Anti-duplikat per penerima
          {
            name: "uq_notifications_dedup",
            columnNames: ["recipient_user_id", "dedup_key"],
            isUnique: true,
            where: '"dedup_key" IS NOT NULL AND "deleted_at" IS NULL',
          },
          // Lookup berdasarkan target; juga dipakai trigger cascade saat induk dihapus
          {
            name: "ix_notifications_target",
            columnNames: ["target_name", "target_reference_id"],
            where: '"target_reference_id" IS NOT NULL',
          },
          {
            name: "ix_notifications_sender",
            columnNames: ["sender_user_id"],
            where: '"sender_user_id" IS NOT NULL',
          },
          // Antrian worker pengiriman
          {
            name: "ix_notifications_pending",
            columnNames: ["created_at"],
            where: `"notif_status" = 'PENDING' AND "deleted_at" IS NULL`,
          },
          // Job pembersih notifikasi kedaluwarsa
          {
            name: "ix_notifications_expires",
            columnNames: ["expires_at"],
            where: '"expires_at" IS NOT NULL AND "deleted_at" IS NULL',
          },
        ],
      }),
      true,
    );

    // ── Integritas target (pengganti FK) ───────────────────────────────
    // 1) INSERT/UPDATE: target harus ada dan belum di-soft-delete.
    const checkBranches = TARGETS.map(
      (t) =>
        `WHEN '${t.name}' THEN PERFORM 1 FROM "${t.table}" WHERE "id" = NEW."target_reference_id" AND "deleted_at" IS NULL;`,
    ).join("\n        ");

    await q.query(`
      CREATE OR REPLACE FUNCTION ${FN_CHECK_TARGET}() RETURNS trigger AS $$
      BEGIN
        -- target_name / target_reference_id tidak berpasangan → biarkan CHECK ck_notifications_target_pair
        -- yang melaporkan (pesan errornya lebih tepat daripada "id NULL tidak ditemukan").
        IF NEW."target_name" IS NULL OR NEW."target_reference_id" IS NULL OR NEW."deleted_at" IS NOT NULL THEN
          RETURN NEW;
        END IF;
        CASE NEW."target_name"
        ${checkBranches}
        ELSE
          RETURN NEW;
        END CASE;
        IF NOT FOUND THEN
          RAISE EXCEPTION '${TABLE}: target % dengan id % tidak ditemukan', NEW."target_name", NEW."target_reference_id"
            USING ERRCODE = '23503';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await q.query(`
      CREATE TRIGGER "trg_notifications_check_target"
        BEFORE INSERT OR UPDATE OF "target_name", "target_reference_id", "deleted_at"
        ON "${TABLE}"
        FOR EACH ROW EXECUTE FUNCTION ${FN_CHECK_TARGET}()
    `);

    // 2) DELETE pada tabel induk: notifikasi yang menargetnya ikut dihapus (setara ON DELETE CASCADE).
    const nameCases = TARGETS.map(
      (t) => `WHEN '${t.table}' THEN '${t.name}'`,
    ).join(" ");
    await q.query(`
      CREATE OR REPLACE FUNCTION ${FN_CASCADE_TARGET}() RETURNS trigger AS $$
      DECLARE
        v_name text := CASE TG_TABLE_NAME ${nameCases} END;
      BEGIN
        DELETE FROM "${TABLE}"
         WHERE "target_name" = v_name
           AND "target_reference_id" = OLD."id";
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql
    `);
    for (const t of TARGETS) {
      await q.query(`
        CREATE TRIGGER "trg_${t.table}_cascade_notifications"
          AFTER DELETE ON "${t.table}"
          FOR EACH ROW EXECUTE FUNCTION ${FN_CASCADE_TARGET}()
      `);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of TARGETS) {
      await q.query(
        `DROP TRIGGER IF EXISTS "trg_${t.table}_cascade_notifications" ON "${t.table}"`,
      );
    }
    await q.dropTable(TABLE, true, true, true); // trigger pada tabel ini ikut terhapus
    await q.query(`DROP FUNCTION IF EXISTS ${FN_CASCADE_TARGET}()`);
    await q.query(`DROP FUNCTION IF EXISTS ${FN_CHECK_TARGET}()`);
  }
}
