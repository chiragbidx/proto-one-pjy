"use server";

import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

// --- Validation schemas ---
export const clientCreateSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  company: z.string().min(2).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  billingDetails: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

export const clientUpdateSchema = clientCreateSchema.extend({
  id: z.string(),
});

export async function createClientAction(input: z.infer<typeof clientCreateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = clientCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Fetch current user's team:
  // Assumes team membership is required (first team found)
  const team = await db.query.teamMembers.findFirst({
    where: (tm) => eq(tm.userId, session.userId)
  });
  if (!team) throw new Error("No team found");

  const [id] = await db
    .insert(clients)
    .values({
      teamId: team.teamId,
      ...parsed.data,
    })
    .returning({ id: clients.id });

  return id;
}

export async function updateClientAction(input: z.infer<typeof clientUpdateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = clientUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Check access: client team association
  const found = await db.query.clients.findFirst({
    where: (c) => and(
      eq(c.id, parsed.data.id),
      eq(c.teamId, session.teamId)
    )
  });
  if (!found) throw new Error("Client not found or forbidden");

  await db
    .update(clients)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(clients.id, parsed.data.id));
}

export async function deleteClientAction(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Check access: client team association
  const found = await db.query.clients.findFirst({
    where: (c) => and(
      eq(c.id, id),
      eq(c.teamId, session.teamId)
    )
  });
  if (!found) throw new Error("Client not found or forbidden");

  await db.delete(clients).where(eq(clients.id, id));
}

export async function archiveClientAction(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Check access: client team association
  const found = await db.query.clients.findFirst({
    where: (c) => and(
      eq(c.id, id),
      eq(c.teamId, session.teamId)
    )
  });
  if (!found) throw new Error("Client not found or forbidden");

  await db
    .update(clients)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(clients.id, id));
}