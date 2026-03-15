-- 0001_client_portal_features.sql

-- CLIENTS TABLE
CREATE TABLE "clients" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "team_id" text NOT NULL,
  "name" text NOT NULL,
  "company" text,
  "email" text,
  "phone" text,
  "address" text,
  "billing_details" jsonb,
  "notes" text,
  "status" text DEFAULT 'active' NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_clients_team" ON "clients" ("team_id");
CREATE INDEX "idx_clients_name" ON "clients" ("name");
ALTER TABLE "clients" ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;

-- PROJECTS TABLE
CREATE TABLE "projects" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" text NOT NULL,
  "team_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'not_started' NOT NULL,
  "priority" text DEFAULT 'medium' NOT NULL,
  "budget" numeric(12,2),
  "start_date" date,
  "due_date" date,
  "owner_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_projects_team" ON "projects" ("team_id");
CREATE INDEX "idx_projects_client" ON "projects" ("client_id");
CREATE INDEX "idx_projects_owner" ON "projects" ("owner_id");
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION;

-- PROJECT MEMBERS
CREATE TABLE "project_members" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "user_id" text NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "project_members_project_user_idx" ON "project_members" ("project_id","user_id");
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

-- MILESTONES
CREATE TABLE "project_milestones" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "due_date" date,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_project_milestones_project" ON "project_milestones" ("project_id");
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;

-- TASKS
CREATE TABLE "project_tasks" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "milestone_id" text,
  "assignee_id" text,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'todo' NOT NULL,
  "due_date" date,
  "time_tracked_minutes" integer DEFAULT 0 NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "order" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_project_tasks_project" ON "project_tasks" ("project_id");
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "project_milestones" ("id") ON DELETE SET NULL;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE SET NULL;

-- COMMENTS/NOTES
CREATE TABLE "project_comments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "milestone_id" text,
  "task_id" text,
  "user_id" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_project_comments_project" ON "project_comments" ("project_id");
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "project_milestones" ("id") ON DELETE SET NULL;
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "project_tasks" ("id") ON DELETE SET NULL;
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION;

-- ATTACHMENTS
CREATE TABLE "project_attachments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "uploaded_by_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_type" text,
  "file_size" integer,
  "metadata" jsonb,
  "storage_key" text,
  "url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_project_attachments_project" ON "project_attachments" ("project_id");
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION;

-- INVOICES
CREATE TABLE "invoices" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" text NOT NULL,
  "project_id" text,
  "team_id" text NOT NULL,
  "number" text NOT NULL,
  "issue_date" date NOT NULL,
  "due_date" date NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "payment_date" date,
  "currency" text DEFAULT 'USD' NOT NULL,
  "subtotal" numeric(12,2) NOT NULL,
  "tax" numeric(12,2) DEFAULT 0.00 NOT NULL,
  "total" numeric(12,2) NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_invoices_team" ON "invoices" ("team_id");
CREATE INDEX "idx_invoices_client" ON "invoices" ("client_id");
CREATE INDEX "idx_invoices_project" ON "invoices" ("project_id");
CREATE UNIQUE INDEX "invoices_number_team_unique" ON "invoices" ("team_id", "number");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;

-- INVOICE LINE ITEMS
CREATE TABLE "invoice_line_items" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" text NOT NULL,
  "description" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "unit_price" numeric(12,2) NOT NULL,
  "total" numeric(12,2) NOT NULL
);
CREATE INDEX "idx_invoice_line_items_invoice" ON "invoice_line_items" ("invoice_id");
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE;

-- TIME ENTRIES
CREATE TABLE "time_entries" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" text NOT NULL,
  "task_id" text,
  "user_id" text NOT NULL,
  "started_at" timestamp with time zone NOT NULL,
  "ended_at" timestamp with time zone,
  "minutes" integer NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_time_entries_project" ON "time_entries" ("project_id");
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "project_tasks" ("id") ON DELETE SET NULL;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

-- AUDIT LOG / ACTIVITY LOG
CREATE TABLE "activity_logs" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "team_id" text NOT NULL,
  "user_id" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "action" text NOT NULL,
  "data" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_activity_logs_team" ON "activity_logs" ("team_id");
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;