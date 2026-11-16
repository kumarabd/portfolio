import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import index from "@/content/blog.generated.json";

export type Series = (typeof index)[number];
export type Post = Series["posts"][number];

export const allSeries = () => index;
export const getSeries = (slug: string) => index.find((s) => s.slug === slug);

export function getPost(series: string, post: string) {
  const s = getSeries(series);
  const i = s?.posts.findIndex((p) => p.slug === post) ?? -1;
  if (!s || i < 0) return undefined;
  const raw = readFileSync(join(process.cwd(), "content/blog", series, s.posts[i].file), "utf8");
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  return { series: s, post: s.posts[i], index: i, prev: s.posts[i - 1], next: s.posts[i + 1], html: marked.parse(body, { async: false }) as string };
}

export const formatDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
