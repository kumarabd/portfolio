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
        className="sticky top-0 flex gap-2 border-b border-[var(--color-border)] bg-[var(--color-background)] p-4"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "bg-transparent text-[var(--color-foreground)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === "Tasks" && <TaskList tasks={tasks} />}
        {activeTab === "Notes" && <NoteList notes={notes} />}
        {activeTab === "Projects" && <WorkspaceProjectList projects={projects} />}
      </div>
    </div>
  );
}
