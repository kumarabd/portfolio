// The whole portfolio as one tree. The mind map walks it; nothing else decides
// what is shown. Facts live in profile.ts / resume.ts / world.ts.
import { PROFILE } from "./profile";
import { RESUME } from "./resume";
import blog from "./blog.generated.json";
import { COMPANIES, IMPACT, MILESTONES, SCHOOLS } from "./world";

export interface MindNode {
  id: string;
  label: string;
  /** one line shown under the title in the detail panel */
  sub?: string;
  /** paragraphs / bullets shown in the detail panel */
  body?: string[];
  tags?: string[];
  /** a link the node follows instead of expanding: external, or a site path */
  href?: string;
  /** an extra link shown in the detail panel */
  link?: { label: string; href: string };
  children?: MindNode[];
  /** set by build: top-level branch colour, inherited down */
  color: string;
  depth: number;
  parent?: string;
}

type Raw = Omit<MindNode, "color" | "depth" | "parent" | "children"> & { children?: Raw[] };

export const ROOT_COLOR = "#1c1a24";
const COLORS = { professional: "#4338ca", writing: "#a16207", fame: "#0f766e", contact: "#be185d" };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const raw: Raw = {
  id: "me",
  label: PROFILE.name,
  sub: `${PROFILE.role} · ${PROFILE.location}`,
  body: [PROFILE.headline, PROFILE.bio],
  tags: PROFILE.focusAreas,
  children: [
    {
      id: "professional",
      label: "Professional",
      sub: "What I build, and where",
      body: ["AI infrastructure, security and observability: the unglamorous layers that make intelligent systems trustworthy."],
      children: [
        ...COMPANIES.map((c) => ({
          id: slug(c.name),
          label: c.name,
          sub: c.location,
          body: c.roles.map((r) => `${r.title} · ${r.period}`),
          tags: c.stack,
          children: c.highlights.map((h, i) => ({
            id: `${slug(c.name)}-${i}`,
            label: h.split(/[:,.]| that | with | and /)[0].replace(/^(An?|The) /, "").slice(0, 34),
            body: [h],
          })),
        })),
        {
          id: "expertise",
          label: "Expertise",
          sub: RESUME.headline,
          children: RESUME.expertise.map((e) => ({ id: slug(e.title), label: e.title, body: [e.summary], tags: e.stack })),
        },
        {
          id: "toolbox",
          label: "Toolbox",
          sub: "What I reach for",
          children: RESUME.skills.map((s) => ({ id: slug(s.label), label: s.label, tags: s.items })),
        },
      ],
    },
    {
      id: "writing",
      label: "Writing",
      sub: "Series, one topic at a time",
      body: ["Posts grouped into focused series: each one goes deep on a single topic."],
      link: { label: "All writing", href: "/blog" },
      children: blog.map((s) => ({
        id: s.slug,
        label: s.title,
        sub: `${s.posts.length} ${s.posts.length === 1 ? "post" : "posts"}`,
        body: [s.summary],
        link: { label: "Open the series", href: `/blog/${s.slug}` },
        children: s.posts.map((p) => ({ id: p.slug, label: p.title, sub: `${p.when} · ${p.minutes} min read`, body: [p.summary], href: `/blog/${s.slug}/${p.slug}` })),
      })),
    },
    {
      id: "fame",
      label: "Hall of Fame",
      sub: "Wins, in numbers",
      body: ["Results I'm proud of, mostly measured."],
      children: [
        {
          id: "schools",
          label: "Schools",
          children: SCHOOLS.map((s) => ({ id: slug(s.name), label: s.name.replace("The University of Texas at Dallas", "UT Dallas").replace("Indian Institute of Technology", "IIT Indore"), sub: s.period, body: [s.degree, s.place] })),
        },
        {
          id: "impact",
          label: "Impact",
          children: IMPACT.map((m) => ({ id: slug(m.label), label: `${m.num}${m.suffix} ${m.label.toLowerCase()}`, body: [m.detail] })),
        },
        {
          id: "milestones",
          label: "Milestones",
          children: MILESTONES.map((m) => ({ id: slug(m.title), label: m.title, sub: m.where, body: [m.detail] })),
        },
      ],
    },
    {
      id: "contact",
      label: "Say hello",
      sub: `${PROFILE.availability}`,
      body: ["The fastest way to reach me is email."],
      children: PROFILE.socialLinks.map((l) => ({ id: slug(l.label), label: l.label, sub: l.handle, href: l.url })),
    },
  ],
};

function build(n: Raw, depth: number, color: string, parent?: string): MindNode {
  const c = depth === 1 ? COLORS[n.id as keyof typeof COLORS] : color;
  const id = depth > 1 && parent ? `${parent}.${n.id}` : n.id;
  return { ...n, id, color: c, depth, parent, children: n.children?.map((k) => build(k, depth + 1, c, id)) };
}

export const TREE = build(raw, 0, ROOT_COLOR);

const index = new Map<string, MindNode>();
(function walk(n: MindNode) {
  if (index.has(n.id)) throw new Error(`duplicate mind node id: ${n.id}`);
  index.set(n.id, n);
  n.children?.forEach(walk);
})(TREE);

export const nodeById = (id: string) => index.get(id);
export const allNodes = () => [...index.values()];

/** root → … → id */
export function pathTo(id: string): string[] {
  const out: string[] = [];
  for (let n = index.get(id); n; n = n.parent ? index.get(n.parent) : undefined) out.unshift(n.id);
  return out;
}
