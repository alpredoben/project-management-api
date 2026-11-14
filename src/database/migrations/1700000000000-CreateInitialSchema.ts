import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1700000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Aktifkan Ekstensi UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // ==========================================
    // 2. TABEL-TABEL UTAMA & MASTER DATA
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(150) NOT NULL,
        "email" VARCHAR(150) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "avatar_url" TEXT,
        "is_active" BOOLEAN DEFAULT TRUE,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(150) UNIQUE NOT NULL,
        "slug" VARCHAR(150) UNIQUE NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "positions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(150) UNIQUE NOT NULL,
        "slug" VARCHAR(150) UNIQUE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "module" VARCHAR(50) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "role_id" UUID REFERENCES "roles"("id") ON DELETE CASCADE,
        "permission_id" UUID REFERENCES "permissions"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("role_id", "permission_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" UUID REFERENCES "roles"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("user_id", "role_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "project_types" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "project_status" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "color_code" VARCHAR(7) DEFAULT '#FFFFFF',
        "sequence_order" INT DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_types" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "icon" VARCHAR(50),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_status" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "color_code" VARCHAR(7) DEFAULT '#FFFFFF',
        "sequence_order" INT DEFAULT 0,
        "is_closed" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    // ==========================================
    // 3. WORKSPACE & PROJECT MANAGEMENT
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(150) NOT NULL,
        "slug" VARCHAR(150) UNIQUE NOT NULL,
        "logo_url" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "workspace_members" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" UUID REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "position_id" UUID REFERENCES "positions"("id") ON DELETE SET NULL,
        "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("workspace_id", "user_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" UUID REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "project_type_id" UUID REFERENCES "project_types"("id") ON DELETE SET NULL,
        "project_status_id" UUID REFERENCES "project_status"("id") ON DELETE SET NULL,
        "name" VARCHAR(150) NOT NULL,
        "key" VARCHAR(20) NOT NULL,
        "description" TEXT,
        "start_date" DATE,
        "end_date" DATE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" UUID REFERENCES "roles"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("project_id", "user_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "milestones" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
        "title" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "due_date" DATE,
        "status" VARCHAR(50) DEFAULT 'open',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    // ==========================================
    // 4. TASK & SCHEDULER
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
        "milestone_id" UUID REFERENCES "milestones"("id") ON DELETE SET NULL,
        "parent_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "task_type_id" UUID REFERENCES "task_types"("id") ON DELETE SET NULL,
        "task_status_id" UUID REFERENCES "task_status"("id") ON DELETE SET NULL,
        "user_requested_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "task_key" VARCHAR(50) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "priority" VARCHAR(50) DEFAULT 'medium',
        "estimated_hours" NUMERIC(5,2) DEFAULT 0.00,
        "due_date" TIMESTAMP WITH TIME ZONE,
        "mom_number" VARCHAR(100),
        "mom_date" DATE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_assignees" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("task_id", "user_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_schedulers" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "actual_hours" NUMERIC(5,2) DEFAULT 0.00,
        "status" VARCHAR(50) DEFAULT 'scheduled',
        "notes" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    // ==========================================
    // 5. KOLABORASI, LIKES, COMMENTS, & ATTACHMENTS
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "task_additional_attachments" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "file_name" VARCHAR(255) NOT NULL,
        "file_url" TEXT NOT NULL,
        "file_size" BIGINT,
        "file_type" VARCHAR(100),
        "uploaded_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_comments" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "parent_comment_id" UUID REFERENCES "task_comments"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "task_likes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" UUID REFERENCES "tasks"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("task_id", "user_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "comment_likes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "comment_id" UUID REFERENCES "task_comments"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID,
        UNIQUE("comment_id", "user_id")
      );
    `);

    // ==========================================
    // 6. LOG & NOTIFIKASI
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" UUID REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "action" VARCHAR(100) NOT NULL,
        "entity_type" VARCHAR(50) NOT NULL,
        "entity_id" UUID NOT NULL,
        "metadata" JSONB,
        "ip_address" VARCHAR(45),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(150) NOT NULL,
        "message" TEXT NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "reference_id" UUID,
        "is_read" BOOLEAN DEFAULT FALSE,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_by" UUID,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_by" UUID,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "deleted_by" UUID
      );
    `);

    // ==========================================
    // 7. QUERY OPTIMIZATION: INDEXES
    // ==========================================

    await queryRunner.query(`CREATE INDEX "idx_users_is_active" ON "users"("is_active");`);
    await queryRunner.query(`CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_permissions_module" ON "permissions"("module");`);
    await queryRunner.query(`CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions"("role_id");`);
    await queryRunner.query(`CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions"("permission_id");`);
    await queryRunner.query(`CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_user_roles_role_id" ON "user_roles"("role_id");`);

    await queryRunner.query(`CREATE INDEX "idx_project_status_order" ON "project_status"("sequence_order");`);
    await queryRunner.query(`CREATE INDEX "idx_task_status_order" ON "task_status"("sequence_order");`);

    await queryRunner.query(`CREATE INDEX "idx_workspaces_slug" ON "workspaces"("slug");`);
    await queryRunner.query(`CREATE INDEX "idx_workspace_members_workspace_id" ON "workspace_members"("workspace_id");`);
    await queryRunner.query(`CREATE INDEX "idx_workspace_members_user_id" ON "workspace_members"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_workspace_members_position_id" ON "workspace_members"("position_id");`);
    await queryRunner.query(`CREATE INDEX "idx_projects_workspace_id" ON "projects"("workspace_id");`);
    await queryRunner.query(`CREATE INDEX "idx_projects_status_id" ON "projects"("project_status_id");`);
    await queryRunner.query(`CREATE INDEX "idx_projects_key" ON "projects"("key");`);
    await queryRunner.query(`CREATE INDEX "idx_project_members_project_id" ON "project_members"("project_id");`);
    await queryRunner.query(`CREATE INDEX "idx_project_members_user_id" ON "project_members"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_milestones_project_id" ON "milestones"("project_id");`);

    await queryRunner.query(`CREATE INDEX "idx_tasks_project_id" ON "tasks"("project_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_milestone_id" ON "tasks"("milestone_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_parent_id" ON "tasks"("parent_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_status_id" ON "tasks"("task_status_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_user_requested_id" ON "tasks"("user_requested_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_task_key" ON "tasks"("task_key");`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_due_date" ON "tasks"("due_date");`);
    await queryRunner.query(`CREATE INDEX "idx_task_assignees_task_id" ON "task_assignees"("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_assignees_user_id" ON "task_assignees"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_schedulers_task_id" ON "task_schedulers"("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_schedulers_user_id" ON "task_schedulers"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_schedulers_time_range" ON "task_schedulers"("start_time", "end_time");`);

    await queryRunner.query(`CREATE INDEX "idx_task_attachments_task_id" ON "task_additional_attachments"("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_comments_task_id" ON "task_comments"("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_comments_parent_id" ON "task_comments"("parent_comment_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_comments_user_id" ON "task_comments"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_task_likes_task_id" ON "task_likes"("task_id");`);
    await queryRunner.query(`CREATE INDEX "idx_comment_likes_comment_id" ON "comment_likes"("comment_id");`);

    await queryRunner.query(`CREATE INDEX "idx_activity_logs_workspace_id" ON "activity_logs"("workspace_id");`);
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_user_id" ON "activity_logs"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_entity" ON "activity_logs"("entity_type", "entity_id");`);
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_created_at" ON "activity_logs"("created_at");`);

    await queryRunner.query(`CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id") WHERE "is_read" = FALSE;`);
    await queryRunner.query(`CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Hapus tabel dengan urutan terbalik dari pembuatan untuk menghindari masalah Foreign Key constraint
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comment_likes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_likes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_comments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_additional_attachments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_schedulers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_assignees";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "milestones";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_members";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "positions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspaces";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_status";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_types";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_status";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_types";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}