import type { SceneDef } from "@/components/world/world-stage";
import { RESUME } from "@/content/resume";
import { COMPANIES } from "@/content/world";

const H2 = "text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.03em]";

/** Professional: structured and technical. Companies, then what I'm good at, then the toolbox. */
export function professionalScenes(): SceneDef[] {
  const companies: SceneDef[] = COMPANIES.map((c) => ({
    id: `co-${c.name}`,
    group: "Companies",
    label: c.name,
    shape: c.shape,
    node: (
      <>
        <p data-d className="data-label text-[color:var(--realm)]">
          {c.location}
        </p>
        <h2 data-d className={`mt-3 ${H2}`}>
          {c.name}
        </h2>
        <ul data-d className="m-0 mt-4 flex list-none flex-col gap-1 p-0">
          {c.roles.map((role) => (
            <li key={role.title} className="flex flex-wrap items-baseline gap-x-4 text-bone">
              {role.title}
              <span className="data-label text-dim">{role.period}</span>
            </li>
          ))}
        </ul>
        <ul data-d className="dash-list m-0 mt-5 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-relaxed text-dim sm:text-base">
          {c.highlights.map((h, i) => (
            <li key={h} className={i > 1 ? "hidden sm:block" : undefined}>
              {h}
            </li>
          ))}
        </ul>
        <ul data-d className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
          {c.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  }));

  const expertise: SceneDef[] = RESUME.expertise.map((e) => ({
    id: `ex-${e.title}`,
    group: "Expertise",
    label: e.title,
    shape: e.shape,
    node: (
      <>
        <h2 data-d className={H2}>
          {e.title}
        </h2>
        <p data-d className="mt-5 max-w-[36ch] text-lg leading-relaxed text-dim">
          {e.summary}
        </p>
        <ul data-d className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
          {e.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  }));

  const toolbox: SceneDef = {
    id: "toolbox",
    group: "Toolbox",
    label: "Toolbox",
    shape: 1,
    node: (
      <>
        <h2 data-d className={H2}>
          Toolbox
        </h2>
        <dl data-d className="m-0 mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {RESUME.skills.map((g) => (
            <div key={g.label}>
              <dt className="data-label mb-1.5 text-[color:var(--realm)]">{g.label}</dt>
              <dd className="m-0 text-sm leading-relaxed text-bone">{g.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  };

  return [...companies, ...expertise, toolbox];
}
