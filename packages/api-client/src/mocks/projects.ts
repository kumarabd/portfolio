import type { Project } from "@mespace/core";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "mespace",
    title: "MeSpace",
    description: "Personal portfolio and private workspace in one Next.js monorepo, deployed as a single app.",
    tags: ["nextjs", "typescript", "monorepo"],
    status: "in-progress",
    published: true,
    repoUrl: "https://github.com/example/mespace",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    id: "queuelite",
    title: "queuelite",
    description: "A tiny, dependency-free job queue backed by Postgres. Built for services that don't need Redis.",
    tags: ["postgresql", "node", "library"],
    status: "done",
    published: true,
    repoUrl: "https://github.com/example/queuelite",
    demoUrl: "https://queuelite.example.com",
    updatedAt: "2026-06-10T00:00:00.000Z",
  },
  {
    id: "old-blog",
    title: "Static Blog Migration",
    description: "Retired a Hugo static site and migrated all content into MeSpace.",
    tags: ["migration"],
    status: "done",
    published: true,
    updatedAt: "2026-07-20T00:00:00.000Z",
  },
  {
    id: "internal-cli",
    title: "Internal CLI Tool",
    description: "Not ready to share publicly yet.",
    tags: ["cli"],
    status: "idea",
    published: false,
    updatedAt: "2026-07-15T00:00:00.000Z",
  },
];
