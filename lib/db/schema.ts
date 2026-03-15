import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
  boolean,
  numeric,
  serial,
  jsonb,
  date,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- EXISTING TABLES (unchanged) ---
export const users = pgTable("users", {
  id: text("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teams = pgTable("teams", {
  id: text("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: text("id")
      .notNull()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("team_members_team_user_idx").on(table.teamId, table.userId),
  ]
);

export const teamInvitations = pgTable("team_invitations", {
  id: text("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  token: text("token").notNull().unique(),
  invitedByUserId: text("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- CLIENTS ---
export const clients = pgTable(
  "clients",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    billingDetails: jsonb("billing_details"),
    notes: text("notes"),
    status: text("status").notNull().default("active"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_clients_team").on(table.teamId),
    index("idx_clients_name").on(table.name),
  ]
);

// --- PROJECTS ---
export const projects = pgTable(
  "projects",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("not_started"),
    priority: text("priority").notNull().default("medium"),
    budget: numeric("budget", { precision: 12, scale: 2 }),
    startDate: date("start_date"),
    dueDate: date("due_date"),
    ownerId: text("owner_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_projects_team").on(table.teamId),
    index("idx_projects_client").on(table.clientId),
    index("idx_projects_owner").on(table.ownerId),
  ]
);

// --- PROJECT TEAM MEMBERS (supporting multiple team members per project) ---
export const projectMembers = pgTable(
  "project_members",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("project_members_project_user_idx").on(
      table.projectId,
      table.userId
    ),
  ]
);

// --- MILESTONES ---
export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    dueDate: date("due_date"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_project_milestones_project").on(table.projectId)]
);

// --- TASKS ---
export const projectTasks = pgTable(
  "project_tasks",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: text("milestone_id")
      .references(() => projectMilestones.id, { onDelete: "set null" }),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("todo"),
    dueDate: date("due_date"),
    timeTrackedMinutes: integer("time_tracked_minutes").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    order: integer("order"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_project_tasks_project").on(table.projectId)]
);

// --- COMMENTS/NOTES (unified, can be linked to project, milestone, or task) ---
export const projectComments = pgTable(
  "project_comments",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: text("milestone_id").references(() => projectMilestones.id, { onDelete: "set null" }),
    taskId: text("task_id").references(() => projectTasks.id, { onDelete: "set null" }),
    userId: text("user_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_project_comments_project").on(table.projectId)]
);

// --- ATTACHMENTS METADATA (metadata only; file storage must be handled externally) ---
export const projectAttachments = pgTable(
  "project_attachments",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    uploadedById: text("uploaded_by_id").notNull().references(() => users.id),
    fileName: text("file_name").notNull(),
    fileType: text("file_type"),
    fileSize: integer("file_size"), // in bytes
    metadata: jsonb("metadata"),
    storageKey: text("storage_key"), // External/object storage key
    url: text("url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_project_attachments_project").on(table.projectId)]
);

// --- INVOICES ---
export const invoices = pgTable(
  "invoices",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text("status").notNull().default("draft"),
    paymentDate: date("payment_date"),
    currency: text("currency").notNull().default("USD"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0.00"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_invoices_team").on(table.teamId),
    index("idx_invoices_client").on(table.clientId),
    index("idx_invoices_project").on(table.projectId),
    uniqueIndex("invoices_number_team_unique").on(table.teamId, table.number),
  ]
);

// --- INVOICE LINE ITEMS ---
export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  },
  (table) =>
    [index("idx_invoice_line_items_invoice").on(table.invoiceId)]
);

// --- TIME TRACKING ENTRIES ---
export const timeEntries = pgTable(
  "time_entries",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    taskId: text("task_id").references(() => projectTasks.id, { onDelete: "set null" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    minutes: integer("minutes").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_time_entries_project").on(table.projectId)]
);

// --- AUDIT LOG / ACTIVITY LOG ENTRIES ---
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: text("id").notNull().default(sql`gen_random_uuid()`).primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    entityType: text("entity_type").notNull(), // e.g., 'client','project','task','invoice'
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(), // e.g., 'created', 'updated', 'deleted', 'status_changed'
    data: jsonb("data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_activity_logs_team").on(table.teamId)]
);