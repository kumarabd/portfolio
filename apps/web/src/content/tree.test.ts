import { describe, expect, it } from "vitest";
import blog from "./blog.generated.json";
import { nodeById } from "./tree";

describe("writing branch", () => {
  it("has a series node per series, each post linking to its page", () => {
    for (const s of blog) {
      const series = nodeById(`writing.${s.slug}`);
      expect(series?.children).toHaveLength(s.posts.length);
      for (const p of s.posts) expect(nodeById(`writing.${s.slug}.${p.slug}`)?.href).toBe(`/blog/${s.slug}/${p.slug}`);
    }
  });
});
