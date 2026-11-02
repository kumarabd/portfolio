import type { Project } from "@mespace/core";
import type { SceneDef } from "@/components/world/world-stage";
import { SHAPE } from "@/components/scene/shapes";
import { PROFILE } from "@/content/profile";
import { HOBBIES } from "@/content/world";

const H2 = "text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.03em]";
const NO_DESC = "No description provided.";

/** Hobby: loose and playful. Real side projects first, then the life around them (placeholders until filled in). */
export function hobbyScenes(projects: Project[]): SceneDef[] {
  const first: SceneDef = {
    id: "projects",
    group: "Hobby",
    label: "Projects",
    shape: SHAPE.blocks,
    node: (
      <>
        <h2 data-d className={H2}>
          Side projects
        </h2>
        <p data-d className="mt-3 max-w-[40ch] text-lg text-dim">
          Things I build for the fun of it.
        </p>
        <div data-d className="mt-6 grid gap-3 sm:grid-cols-2">
          {projects.slice(0, 6).map((p) => {
            const body = (
              <>
                <span className="data-label text-[color:var(--realm)]">{p.tags[0] ?? "Open source"}</span>
                <span className="mt-1 block font-display text-xl leading-tight">{p.title}</span>
                {p.description && p.description !== NO_DESC && <span className="mt-1.5 block text-sm leading-snug text-dim">{p.description}</span>}
              </>
            );
            const href = p.repoUrl ?? p.demoUrl;
            return href ? (
              <a key={p.id} href={href} className="tile">
                {body}
              </a>
            ) : (
              <div key={p.id} className="tile">
                {body}
              </div>
            );
          })}
        </div>
        <a data-d href={`https://github.com/${PROFILE.githubUsername}?tab=repositories`} className="data-label mt-6 inline-block text-dim transition-colors hover:text-bone">
          All repos &#8599;
        </a>
      </>
    ),
  };

  const rest: SceneDef[] = HOBBIES.map((h) => ({
    id: h.id,
    group: "Hobby",
    label: h.label,
    shape: h.shape,
    node: (
      <>
        <h2 data-d className={H2}>
          {h.label}
        </h2>
        <p data-d className="data-label mt-3 w-fit border border-dashed border-hairline px-2 py-1 text-dim">
          Placeholder
        </p>
        <div data-d className="mt-6 grid gap-3 sm:grid-cols-3">
          {h.tiles.map((t) => (
            <div key={t.title} className="tile" data-placeholder>
              <span className="block font-display text-xl leading-tight">{t.title}</span>
              <span className="mt-1.5 block text-sm leading-snug text-dim">{t.note}</span>
            </div>
          ))}
        </div>
      </>
    ),
  }));

  return [first, ...rest];
}
