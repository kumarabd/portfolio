import type { Project } from "@mespace/core";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "mespace",
    title: "MeSpace",
    description: "Personal branding site and private workspace, in one app.",
    tags: ["nextjs", "personal"],
    status: "in-progress",
    published: true,
    repoUrl: "https://github.com/example/mespace",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    id: "old-blog",
    title: "Static Blog Migration",
    description: "Retired Hugo static site, migrated content into MeSpace.",
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
