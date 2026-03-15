"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  budget: string | null;
  startDate: string | null;
  dueDate: string | null;
  clientId: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Placeholder: Fetch from server
  const projects: Project[] = [];

  const filtered = query
    ? projects.filter((p) =>
        [p.name, p.description, p.status, p.priority]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : projects;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <Input
          className="max-w-sm"
          icon={<Search className="size-4" />}
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Separator className="mb-4" />
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            No projects found.
          </div>
        ) : (
          filtered.map((project) => (
            <Card
              key={project.id}
              className="flex items-center gap-6 justify-between hover:bg-accent p-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{project.name}</span>
                  {project.status && (
                    <Badge className="bg-primary/10 text-primary border-none">
                      {project.status}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {project.description}
                </div>
                {project.priority && (
                  <div className="text-xs mt-1 font-semibold">
                    Priority: {project.priority}
                  </div>
                )}
                {project.budget && (
                  <div className="text-xs">
                    Budget: <span className="font-semibold">${project.budget}</span>
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
                  variant="destructive"
                  onClick={() => {
                    /* Delete project */
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* TODO: Modal for create/edit project */}
    </section>
  );
}