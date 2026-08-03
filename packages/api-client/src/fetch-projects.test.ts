import { describe, expect, it } from "vitest";
import { fetchProjects } from "./fetch-projects";

describe("fetchProjects", () => {
  it("returns a non-empty list of valid projects", async () => {
    const projects = await fetchProjects();

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((p) => p.published)).toBe(true);
  });
});
