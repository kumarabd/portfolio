import type { Task } from "@mespace/core";

export const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Write resume content", status: "todo", projectId: "mespace" },
  {
    id: "t2",
    title: "Wire up workspace tabs",
    status: "in-progress",
    projectId: "mespace",
  },
  { id: "t3", title: "Migrate old blog posts", status: "done", projectId: "old-blog" },
];
