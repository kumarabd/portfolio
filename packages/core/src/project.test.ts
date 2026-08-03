import { describe, expect, it } from "vitest";
import { ProjectSchema } from "./project";

describe("ProjectSchema", () => {
  const valid = {
    id: "p1",
    title: "MeSpace",
    description: "Personal branding and workspace app.",
    tags: ["nextjs", "personal"],
    status: "in-progress",
    published: true,
    updatedAt: "2026-08-01T00:00:00.000Z",
  };

  it("accepts a valid project", () => {
    expect(ProjectSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    expect(ProjectSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false);
  });

  it("rejects a non-boolean published flag", () => {
    expect(ProjectSchema.safeParse({ ...valid, published: "yes" }).success).toBe(false);
  });
});
