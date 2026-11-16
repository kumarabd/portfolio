// Builds src/content/blog.generated.json from content/blog/**.md (metadata only).
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content/blog");

function parse(file) {
  const m = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: m[2] };
}
const need = (file, data, ...keys) => keys.forEach((k) => { if (!data[k]) throw new Error(`${file}: frontmatter needs "${k}"`); });

const series = [];
for (const s of readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()).sort()) {
  const meta = join(dir, s, "_series.md");
  const { data } = parse(meta);
  need(meta, data, "title", "summary");
  const posts = [];
  for (const f of readdirSync(join(dir, s)).filter((n) => /^\d+-.+\.md$/.test(n)).sort()) {
    const file = join(dir, s, f);
    const { data: d, body } = parse(file);
    need(file, d, "title", "summary", "date");
    if (d.draft === "true") continue;
    posts.push({ slug: f.replace(/^\d+-/, "").replace(/\.md$/, ""), file: f, title: d.title, summary: d.summary, date: d.date, minutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)) });
  }
  if (posts.length) series.push({ slug: s, title: data.title, summary: data.summary, order: Number(data.order ?? 100), posts });
}
series.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
writeFileSync(join(root, "src/content/blog.generated.json"), JSON.stringify(series.map(({ order, ...s }) => s), null, 2) + "\n");
console.log(`blog index: ${series.length} series, ${series.reduce((n, s) => n + s.posts.length, 0)} posts`);
