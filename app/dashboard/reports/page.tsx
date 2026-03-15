"use client";

import * as React from "react";
import { BarChart2, TrendingUp, Layers, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Metric = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};

const metrics: Metric[] = [
  { label: "Total Clients", value: "--", icon: <Layers className="w-5 h-5" /> },
  { label: "Total Projects", value: "--", icon: <FileText className="w-5 h-5" /> },
  { label: "Outstanding Invoices", value: "--", icon: <BarChart2 className="w-5 h-5" /> },
  { label: "Revenue YTD", value: "--", icon: <TrendingUp className="w-5 h-5" /> },
];

export default function ReportsPage() {
  // In a real app, these metrics would be fetched/static-generated from the DB.
  // Also consider adding charts, overdue lists, etc.
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <Card key={m.label} className="flex flex-col items-center gap-3 p-6">
            <div className="text-primary">{m.icon}</div>
            <div className="text-sm uppercase text-muted-foreground tracking-wide">{m.label}</div>
            <div className="font-bold text-2xl">{m.value}</div>
          </Card>
        ))}
      </div>
      <Separator className="mb-8" />
      {/* TODO: Add recent activity log, overdue invoices listing, other widgets */}
    </section>
  );
}