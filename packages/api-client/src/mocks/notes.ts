import type { Note } from "@mespace/core";

export const MOCK_NOTES: Note[] = [
  {
    id: "n1",
    title: "Workspace theme rationale",
    body: "Distinct dark/teal theme for /workspace signals you've left the public site.",
    tags: ["design"],
    projectId: "mespace",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    id: "n2",
    title: "Resume content ideas",
    body: "Lead with recent project work, keep skills list short and scannable.",
    tags: ["resume"],
    updatedAt: "2026-07-28T00:00:00.000Z",
  },
];
