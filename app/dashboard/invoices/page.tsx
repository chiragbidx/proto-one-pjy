"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Invoice = {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  status: string;
  total: string;
  clientId: string;
  projectId: string | null;
  currency: string;
};

export default function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Placeholder: Fetch from server
  const invoices: Invoice[] = [];

  const filtered = query
    ? invoices.filter((i) =>
        [
          i.number,
          i.status,
          i.total,
          i.currency,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : invoices;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 size-4" />
          New Invoice
        </Button>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <Input
          className="max-w-sm"
          icon={<Search className="size-4" />}
          placeholder="Search invoices…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Separator className="mb-4" />
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            No invoices found.
          </div>
        ) : (
          filtered.map((invoice) => (
            <Card
              key={invoice.id}
              className="flex items-center gap-6 justify-between hover:bg-accent p-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">#{invoice.number}</span>
                  <Badge className="uppercase" variant="secondary">
                    {invoice.status}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none">
                    {invoice.currency}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Issued: {invoice.issueDate} | Due: {invoice.dueDate}
                </div>
                <div className="text-xs mt-1 font-semibold">
                  Amount: {invoice.total}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    /* Open view/edit modal */
                  }}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    /* Delete invoice */
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}