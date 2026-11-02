import { ExpertiseChapters } from "@/components/expertise-chapters";
import { RESUME } from "@/content/resume";

const H2 = "mb-8 text-4xl tracking-[-0.02em] sm:text-5xl";

export default function ResumePage() {
  return (
    <main className="px-5 pb-[14vh] pt-40 sm:px-10">
      <div data-stage="0" data-side="1" data-dim="0.2">
      <h1 data-split className="text-[clamp(3.25rem,11vw,6rem)] leading-[0.95] tracking-[-0.03em]">
        About
      </h1>
      <p data-reveal className="mb-20 mt-6 max-w-[40ch] text-lg text-dim">
        {RESUME.headline}
      </p>
      </div>

      <h2 data-split className={H2}>
        Expertise
      </h2>
      <ExpertiseChapters />

      <section data-stage="1" data-side="1" data-dim="0.4" className="mb-24">
        <h2 data-split className={H2}>
          Toolbox
        </h2>
        <dl data-reveal className="m-0 grid max-w-[1000px] gap-x-12 gap-y-8 sm:grid-cols-2">
          {RESUME.skills.map((group) => (
            <div key={group.label}>
              <dt className="data-label mb-2 text-signal">{group.label}</dt>
              <dd className="m-0 leading-relaxed text-bone">{group.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section data-stage="2" data-side="1" data-dim="0.5">
        <h2 data-split className={H2}>
          What I like
        </h2>
        <ul data-reveal className="m-0 flex max-w-[68ch] list-none flex-col gap-4 p-0 text-lg leading-relaxed text-bone">
          {RESUME.likes.map((l) => (
            <li key={l} className="relative pl-6 before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-3 before:bg-signal">
              {l}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
