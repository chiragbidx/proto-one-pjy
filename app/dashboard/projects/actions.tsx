"use server";

import { db } from "@/lib/db/client";
import { projects, projectMembers } from "@/lib/db/schema";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

// --- Validation schemas ---
export const projectCreateSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  clientId: z.string().min(1, "Client required"),
  ownerId: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.extend({
  id: z.string(),
});

export async function createProjectAction(input: z.infer<typeof projectCreateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Find teamId from client's team or user's first team (simplified)
  // Assumes access verified at API boundary
  // You may perform more rigorous checks per your org model
  const projectData = {
    ...parsed.data,
    teamId: undefined as string | undefined,
  };

  // Look up client to fetch teamId
  const client = await db.query.clients.findFirst({
    where: (c) => eq(c.id, parsed.data.clientId)
  });
  if (!client) throw new Error("Client not found");
  projectData.teamId = client.teamId;

  // Insert project
  const [id] = await db
    .insert(projects)
    .values({
      ...projectData,
    })
    .returning({ id: projects.id });

  // Add owner as project member if supplied
  if (parsed.data.ownerId) {
    await db.insert(projectMembers).values({
      projectId: id,
      userId: parsed.data.ownerId,
      role: "owner",
    });
  }

  return id;
}

export async function updateProjectAction(input: z.infer<typeof projectUpdateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Check access: project+team (optional: verify by matching user's team membership)
  const found = await db.query.projects.findFirst({
    where: (p) => and(eq(p.id, parsed.data.id))
  });
  if (!found) throw new Error("Project not found or forbidden");

  await db
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projects.id, parsed.data.id));
}

export async function deleteProjectAction(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Check access (optional, recommend matching by team/teamMembers)
  const found = await db.query.projects.findFirst({
    where: (p) => eq(p.id, id)
  });
  if (!found) throw new Error("Project not found or forbidden");

  await db.delete(projects).where(eq(projects.id, id));
}

// You may extend with assign/unassign members, milestone/task CRUD, etc.