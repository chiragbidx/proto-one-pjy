"use server";

import { db } from "@/lib/db/client";
import { invoices, invoiceLineItems } from "@/lib/db/schema";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

export const invoiceCreateSchema = z.object({
  clientId: z.string().min(1, "Client required"),
  projectId: z.string().optional().nullable(),
  number: z.string().min(1, "Invoice number required"),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default("USD"),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().int().default(1),
      unitPrice: z.string(),
      total: z.string(),
    })
  ),
  subtotal: z.string(),
  tax: z.string().optional().default("0.00"),
  total: z.string(),
  status: z.string().default("draft"),
  paymentDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const invoiceUpdateSchema = invoiceCreateSchema.extend({
  id: z.string()
});

export async function createInvoiceAction(input: z.infer<typeof invoiceCreateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  const parsed = invoiceCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Find teamId from client
  const client = await db.query.clients.findFirst({
    where: (c) => eq(c.id, parsed.data.clientId)
  });
  if (!client) throw new Error("Client not found");
  const teamId = client.teamId;

  // Insert invoice
  const [invoiceRow] = await db
    .insert(invoices)
    .values({
      ...parsed.data,
      teamId,
    })
    .returning({ id: invoices.id });

  // Insert line items
  for (const item of parsed.data.lineItems) {
    await db.insert(invoiceLineItems).values({
      invoiceId: invoiceRow.id,
      ...item,
    });
  }

  return invoiceRow.id;
}

export async function updateInvoiceAction(input: z.infer<typeof invoiceUpdateSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  const parsed = invoiceUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  // Check access by invoice id (optional: cross-check team)
  const found = await db.query.invoices.findFirst({
    where: (inv) => eq(inv.id, parsed.data.id)
  });
  if (!found) throw new Error("Invoice not found");

  await db
    .update(invoices)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(invoices.id, parsed.data.id));
  // Update line items as required separately!
}

export async function deleteInvoiceAction(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Check access
  const found = await db.query.invoices.findFirst({
    where: (inv) => eq(inv.id, id)
  });
  if (!found) throw new Error("Invoice not found or forbidden");

  await db.delete(invoices).where(eq(invoices.id, id));
  // Line items will be deleted via cascade.
}