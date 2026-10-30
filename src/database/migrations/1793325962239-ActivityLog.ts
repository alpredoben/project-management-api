import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { uuidCol, uuidPk } from "../migration-helper";

const TABLE = SCHEMA_NAMES.ACTIVITY_LOGS;
const FN_GUARD = "fn_activity_logs_guard";

export class ActivityLogs1793325962239 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: TABLE,
        columns: [
          uuidPk(),

          // Actor (pelaku aksi) & snapshot nama
          {
            ...uuidCol("actor_user_id", true),
            comment:
              "NULL = aksi sistem / user sudah dihapus (lihat actor_name)",
          },
          {
            name: "actor_name",
            type: "varchar",
            length: "200",
            default: "'system'",
            comment: "snapshot nama pelaku saat aksi terjadi",
          },

          // ── Aksi & objek ─────────────────────────────────────────────
          {
            name: "action",
            type: "varchar",
            length: "30",
            comment:
              "CREATE, UPDATE, DELETE, RESTORE, STATUS_CHANGE, ASSIGN, UNASSIGN, COMMENT, LIKE, UNLIKE, UPLOAD, DOWNLOAD, LOGIN, LOGOUT, EXPORT",
          },
          {
            name: "entity_type",
            type: "varchar",
            length: "30",
            comment:
              "PROJECTS, TASKS, MEMBERS, TASK_MEMBERS, COMMENTS, PROGRESS_LOGS, ATTACHMENTS, NOTIFICATIONS, SETTINGS, USERS, OTHER",
          },
          {
            name: "entity_id",
            type: "uuid",
            isNullable: true,
            comment:
              "id objek yang dikenai aksi; boleh NULL hanya untuk LOGIN / LOGOUT / EXPORT",
          },

          // ── Konteks (untuk feed per project / task) ──────────────────
          {
            name: "reference_type",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment:
              "PROJECTS, TASKS, MEMBERS, TASK_MEMBERS, COMMENTS, PROGRESS_LOGS, ATTACHMENTS, NOTIFICATIONS, SETTINGS, USERS, OTHER",
          },

          uuidCol("reference_id", true),

          // ── Detail perubahan ─────────────────────────────────────────
          {
            name: "description",
            type: "text",
            isNullable: true,
            comment: "ringkasan yang mudah dibaca manusia",
          },
          {
            name: "old_values",
            type: "jsonb",
            isNullable: true,
            comment: "nilai sebelum (object); NULL untuk CREATE",
          },
          {
            name: "new_values",
            type: "jsonb",
            isNullable: true,
            comment: "nilai sesudah (object); NULL untuk DELETE",
          },
          {
            name: "metadata",
            type: "jsonb",
            default: "'{}'::jsonb",
            comment: "data tambahan (object JSON)",
          },

          // ── Asal request ─────────────────────────────────────────────
          {
            name: "source",
            type: "varchar",
            length: "20",
            default: "'WEB'",
            comment: "'WEB', 'MOBILE', 'API', 'SYSTEM', 'JOB'",
          },
          {
            name: "request_id",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "correlation id / trace id",
          },
          {
            name: "ip_address",
            type: "inet",
            isNullable: true,
            comment: "alamat IP klien",
          },
          { name: "user_agent", type: "text", isNullable: true },

          {
            name: "occurred_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            comment: "waktu kejadian",
          },
        ],

        checks: [
          {
            name: "ck_activity_logs_action",
            expression:
              "action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'STATUS_CHANGE', 'ASSIGN', 'UNASSIGN', 'COMMENT', 'LIKE', 'UNLIKE', 'UPLOAD', 'DOWNLOAD', 'LOGIN', 'LOGOUT', 'EXPORT')",
          },
          {
            name: "ck_activity_logs_entity_type",
            expression:
              "entity_type IN ('PROJECTS', 'TASKS', 'MEMBERS', 'TASK_MEMBERS', 'COMMENTS', 'PROGRESS_LOGS', 'ATTACHMENTS', 'NOTIFICATIONS', 'SETTINGS', 'USERS', 'OTHER')",
          },
          {
            name: "ck_activity_logs_source",
            expression: "source IN ('WEB', 'MOBILE', 'API', 'SYSTEM', 'JOB')",
          },
          {
            name: "ck_activity_logs_entity_id",
            expression:
              "entity_id IS NOT NULL OR action IN ('LOGIN', 'LOGOUT', 'EXPORT')",
          },
          {
            name: "ck_activity_logs_actor_name",
            expression: "char_length(btrim(actor_name)) > 0",
          },

          // Bentuk JSON
          {
            name: "ck_activity_logs_json_shape",
            expression:
              "(old_values IS NULL OR jsonb_typeof(old_values) = 'object') AND (new_values IS NULL OR jsonb_typeof(new_values) = 'object') AND jsonb_typeof(metadata) = 'object'",
          },
          // Konsistensi aksi ↔ nilai sebelum/sesudah
          {
            name: "ck_activity_logs_create_no_old",
            expression: "action <> 'CREATE' OR old_values IS NULL",
          },
          {
            name: "ck_activity_logs_delete_no_new",
            expression: "action <> 'DELETE' OR new_values IS NULL",
          },
        ],

        // SET NULL: log tetap ada walau user / project / task dihapus
        foreignKeys: [
          {
            name: "fk_activity_logs_actor",
            columnNames: ["actor_user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
          {
            name: "fk_activity_logs_project",
            columnNames: ["project_id"],
            referencedTableName: "projects",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
          {
            name: "fk_activity_logs_task",
            columnNames: ["task_id"],
            referencedTableName: "tasks",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],

        indices: [
          // Riwayat sebuah objek
          {
            name: "ix_activity_logs_entity",
            columnNames: ["entity_type", "entity_id", "occurred_at"],
          },
          // Feed per user / project / task
          {
            name: "ix_activity_logs_actor",
            columnNames: ["actor_user_id", "occurred_at"],
            where: '"actor_user_id" IS NOT NULL',
          },
          {
            name: "ix_activity_logs_project",
            columnNames: ["project_id", "occurred_at"],
            where: '"project_id" IS NOT NULL',
          },
          {
            name: "ix_activity_logs_task",
            columnNames: ["task_id", "occurred_at"],
            where: '"task_id" IS NOT NULL',
          },
          {
            name: "ix_activity_logs_action",
            columnNames: ["action", "occurred_at"],
          },
          {
            name: "ix_activity_logs_request",
            columnNames: ["request_id"],
            where: '"request_id" IS NOT NULL',
          },
        ],
      }),
      true,
    );

    // BRIN: sangat kecil & cocok untuk tabel append-only yang berurutan menurut waktu
    // (membantu job retensi dan query rentang waktu). Tidak didukung Table API → raw SQL.
    await q.query(`
      CREATE INDEX "brin_activity_logs_occurred_at" ON "${TABLE}" USING BRIN ("occurred_at")
    `);

    // ── Guard append-only ──────────────────────────────────────────────
    await q.query(`
      CREATE OR REPLACE FUNCTION ${FN_GUARD}() RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          -- Satu-satunya UPDATE yang sah: FK "ON DELETE SET NULL" pada actor_user_id / project_id / task_id.
          IF (to_jsonb(NEW) - 'actor_user_id' - 'project_id' - 'task_id')
               IS DISTINCT FROM (to_jsonb(OLD) - 'actor_user_id' - 'project_id' - 'task_id')
             OR (NEW."actor_user_id" IS NOT NULL AND NEW."actor_user_id" IS DISTINCT FROM OLD."actor_user_id")
             OR (NEW."project_id"    IS NOT NULL AND NEW."project_id"    IS DISTINCT FROM OLD."project_id")
             OR (NEW."task_id"       IS NOT NULL AND NEW."task_id"       IS DISTINCT FROM OLD."task_id")
          THEN
            RAISE EXCEPTION '${TABLE} bersifat append-only: UPDATE ditolak'
              USING ERRCODE = '23001';
          END IF;
          RETURN NEW;
        END IF;

        -- DELETE / TRUNCATE hanya untuk job retensi
        IF current_setting('app.allow_activity_log_purge', true) = 'on' THEN
          IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
          RETURN NULL;
        END IF;
        RAISE EXCEPTION '${TABLE} bersifat append-only: % ditolak (untuk retensi gunakan SET LOCAL app.allow_activity_log_purge = ''on'')', TG_OP
          USING ERRCODE = '23001';
      END;
      $$ LANGUAGE plpgsql
    `);
    await q.query(`
      CREATE TRIGGER "trg_activity_logs_guard_row"
        BEFORE UPDATE OR DELETE ON "${TABLE}"
        FOR EACH ROW EXECUTE FUNCTION ${FN_GUARD}()
    `);
    await q.query(`
      CREATE TRIGGER "trg_activity_logs_guard_truncate"
        BEFORE TRUNCATE ON "${TABLE}"
        FOR EACH STATEMENT EXECUTE FUNCTION ${FN_GUARD}()
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(TABLE, true, true, true); // trigger & index ikut terhapus
    await q.query(`DROP FUNCTION IF EXISTS ${FN_GUARD}()`);
  }
}
