"use client";

import { useState } from "react";
import type { Note, Project, Task } from "@mespace/core";
import { TaskList } from "./task-list";
import { NoteList } from "./note-list";
import { WorkspaceProjectList } from "./workspace-project-list";

const TABS = ["Tasks", "Notes", "Projects"] as const;
type Tab = (typeof TABS)[number];

export function WorkspaceTabs({
  tasks,
  notes,
  projects,
}: {
  tasks: Task[];
  notes: Note[];
  projects: Project[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: "var(--space-sm)",
          padding: "var(--space-md)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "var(--color-background)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              cursor: "pointer",
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: activeTab === tab ? "var(--color-primary)" : "transparent",
              color: activeTab === tab ? "var(--color-on-primary)" : "var(--color-foreground)",
              fontWeight: 600,
              transition: "all 200ms ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: "var(--space-md)" }}>
        {activeTab === "Tasks" && <TaskList tasks={tasks} />}
        {activeTab === "Notes" && <NoteList notes={notes} />}
        {activeTab === "Projects" && <WorkspaceProjectList projects={projects} />}
      </div>
    </div>
  );
}
