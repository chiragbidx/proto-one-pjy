"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Search, Archive, X, Loader2 } from "lucide-react";
import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
  archiveClientAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  billingDetails: any | null;
  notes: string | null;
  status: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

type ClientFormValues = {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  billingDetails?: string | null;
  notes?: string | null;
  status?: string | null;
};

const initialFormValues: ClientFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  billingDetails: "",
  notes: "",
  status: "active",
};

export default function ClientsPage() {
  // States for data and modals
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormValues>(initialFormValues);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Placeholder: SSR fetch
  const [clients, setClients] = useState<Client[]>([]);

  // Filter client list
  const filtered = query
    ? clients.filter((c) =>
        [c.name, c.company, c.email]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : clients;

  function openCreateModal() {
    setForm(initialFormValues);
    setIsEditMode(false);
    setEditingClient(null);
    setFormError(null);
    setShowModal(true);
  }
  function openEditModal(client: Client) {
    setForm({
      name: client.name || "",
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      billingDetails: client.billingDetails ? JSON.stringify(client.billingDetails) : "",
      notes: client.notes || "",
      status: client.status || "active",
    });
    setEditingClient(client);
    setIsEditMode(true);
    setFormError(null);
    setShowModal(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let result;
      if (isEditMode && editingClient) {
        result = await updateClientAction({
          ...form,
          id: editingClient.id,
          billingDetails: form.billingDetails ? JSON.parse(form.billingDetails) : null,
        });
      } else {
        result = await createClientAction({
          ...form,
          billingDetails: form.billingDetails ? JSON.parse(form.billingDetails) : null,
        });
      }
      setShowModal(false);
      toast.success(`Client ${isEditMode ? "updated" : "created"} successfully!`);

      // Update local list (optimistic; in production re-fetch from server)
      if (!isEditMode) {
        setClients([...clients, { ...form, id: result, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Client]);
      } else if (editingClient) {
        setClients(
          clients.map((c) => (c.id === editingClient.id ? { ...c, ...form } : c))
        );
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save client.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 size-4" />
          New Client
        </Button>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <Input
          className="max-w-sm"
          icon={<Search className="size-4" />}
          placeholder="Search clients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Separator className="mb-4" />
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            No clients found.
          </div>
        ) : (
          filtered.map((client) => (
            <Card
              key={client.id}
              className={`flex items-center gap-6 justify-between hover:bg-accent p-4 ${
                client.isArchived ? "opacity-60" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{client.name}</span>
                  {client.company && (
                    <Badge className="bg-primary/10 text-primary border-none">
                      {client.company}
                    </Badge>
                  )}
                  {client.isArchived && (
                    <Badge className="ml-1" variant="secondary">
                      Archived
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {client.email}
                  {client.phone ? ` • ${client.phone}` : ""}
                </div>
                {client.status && client.status !== "active" && (
                  <div className="text-xs mt-1 font-semibold text-yellow-800">
                    {client.status.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => openEditModal(client)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Archive client (could confirm with modal)
                  }}
                >
                  <Archive className="size-4 mr-1" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    // Delete client (could confirm with modal)
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Client" : "Add New Client"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="size-6 absolute right-2 top-2">
                <X className="size-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <form className="space-y-4 py-2" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <Input
                value={form.company || ""}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={form.phone || ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Billing Details (JSON)
              </label>
              <Textarea
                rows={2}
                value={form.billingDetails || ""}
                onChange={(e) => setForm((f) => ({ ...f, billingDetails: e.target.value }))}
                placeholder='{"vatNumber": "xxx", "address": "..."}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                rows={2}
                value={form.notes || ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Input
                value={form.status || "active"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                placeholder="active, prospect, archived…"
              />
            </div>
            {formError && (
              <div className="text-sm text-red-600">{formError}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                {isEditMode ? "Update Client" : "Add Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}