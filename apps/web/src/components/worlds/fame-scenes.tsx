import type { SceneDef } from "@/components/world/world-stage";
import { SHAPE } from "@/components/scene/shapes";
import { AWARDS, IMPACT, MILESTONES, PRESS, SCHOOLS } from "@/content/world";

const H2 = "text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.96] tracking-[-0.03em]";

const Title = ({ children, note }: { children: React.ReactNode; note?: string }) => (
  <>
    <h2 data-d className={H2}>
      {children}
    </h2>
    {note && (
      <p data-d className="data-label mx-auto mt-3 w-fit border border-dashed border-hairline px-2 py-1 text-dim">
        {note}
      </p>
    )}
  </>
);

/** Hall of Fame: ceremonial. Centred, framed, a gold trophy behind it all. */
export function fameScenes(): SceneDef[] {
  return [
    {
      id: "schools",
      group: "Hall of Fame",
      label: "Schools",
      shape: SHAPE.cap,
      node: (
        <>
          <Title>Schools</Title>
          <div data-d className="mt-8 grid gap-4 sm:grid-cols-2">
            {SCHOOLS.map((s) => (
              <article key={s.name} className="frame text-left">
                <p className="data-label text-[color:var(--realm)]">{s.period}</p>
                <h3 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight">{s.degree}</h3>
                <p className="mt-3 text-bone">{s.name}</p>
                <p className="data-label mt-1 text-dim">{s.place}</p>
              </article>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "impact",
      group: "Hall of Fame",
      label: "Impact",
      shape: SHAPE.pulse,
      node: (
        <>
          <Title>Impact</Title>
          <div data-d className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {IMPACT.map((m) => (
              <div key={m.label} className="frame">
                <p
                  data-num={m.num}
                  data-suffix={m.suffix}
                  className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-none tracking-tight text-[color:var(--realm)]"
                >
                  {m.num}
                  {m.suffix}
                </p>
                <p className="mt-3 font-display text-lg leading-tight">{m.label}</p>
                <p className="data-label mt-2 text-dim">{m.detail}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "milestones",
      group: "Hall of Fame",
      label: "Milestones",
      shape: SHAPE.shield,
      node: (
        <>
          <Title>Milestones</Title>
          <div data-d className="mt-8 grid gap-4 sm:grid-cols-3">
            {MILESTONES.map((m) => (
              <article key={m.title} className="frame text-left">
                <p className="data-label text-[color:var(--realm)]">{m.where}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">{m.detail}</p>
              </article>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "awards",
      group: "Hall of Fame",
      label: "Awards",
      shape: SHAPE.trophy,
      node: (
        <>
          <Title note="Placeholder">Awards</Title>
          <div data-d className="mt-8 grid gap-4 sm:grid-cols-3">
            {AWARDS.map((a) => (
              <article key={a.title} className="frame text-left" data-placeholder>
                <h3 className="font-display text-2xl leading-tight tracking-tight">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">{a.note}</p>
              </article>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "press",
      group: "Hall of Fame",
      label: "On the record",
      shape: SHAPE.mic,
      node: (
        <>
          <Title note="Placeholder">On the record</Title>
          <p data-d className="mx-auto mt-4 max-w-[40ch] text-lg text-dim">
            Podcasts, press and talks.
          </p>
          <div data-d className="mt-6 grid gap-4 sm:grid-cols-3">
            {PRESS.map((a) => (
              <article key={a.title} className="frame text-left" data-placeholder>
                <h3 className="font-display text-2xl leading-tight tracking-tight">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">{a.note}</p>
              </article>
            ))}
          </div>
        </>
      ),
    },
  ];
}
