import { describe, expect, it } from "vitest";
import { COMPANIES, IMPACT, MILESTONES, REALMS, SCHOOLS } from "./world";

describe("world content", () => {
  it("links every realm to its own page", () => {
    expect(new Set(REALMS.map((r) => r.href)).size).toBe(REALMS.length);
  });
  it("fills every world", () => {
    for (const list of [COMPANIES, SCHOOLS, IMPACT, MILESTONES]) expect(list.length).toBeGreaterThan(0);
  });
  it("gives every company a tech stack and highlights", () => {
    for (const c of COMPANIES) {
      expect(c.stack.length).toBeGreaterThan(0);
      expect(c.highlights.length).toBeGreaterThan(0);
    }
  });
});
