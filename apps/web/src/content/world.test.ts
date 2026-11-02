import { describe, expect, it } from "vitest";
import { ENTRIES, REALMS, byRealm } from "./world";

describe("world content", () => {
  it("has unique entry ids", () => {
    expect(new Set(ENTRIES.map((e) => e.id)).size).toBe(ENTRIES.length);
  });
  it("fills every realm", () => {
    for (const r of REALMS) expect(byRealm(r.id).length).toBeGreaterThan(0);
  });
  it("flags every hobby as a placeholder", () => {
    expect(byRealm("hobby").every((e) => e.placeholder)).toBe(true);
  });
});
