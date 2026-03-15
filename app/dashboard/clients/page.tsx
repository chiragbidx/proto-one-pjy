"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Search, Archive } from "lucide-react";
import { createClientAction, updateClientAction, deleteClientAction, archiveClientAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

export default function ClientsPage() {
  // State for client list, search, modal forms, etc.
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Placeholder: Fetch clients from server using server action or loader
  // Would paginate in production, omitted for brevity

  // TODO: Replace with SSR data fetch
  const clients: Client[] = [];

  const filtered = query
    ? clients.filter((c) =>
        [c.name, c.company, c.email].join(" ").toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button onClick={() => setShowCreate(true)}>
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
                  onClick={() => {
                    /* Open edit modal */
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    /* Archive client */
                  }}
                >
                  <Archive className="size-4 mr-1" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    /* Delete client */
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* TODO: Modal for create/edit client */}
    </section>
  );
}