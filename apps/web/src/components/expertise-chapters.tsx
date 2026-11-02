import { RESUME } from "@/content/resume";

/** One full-height chapter per expertise; the 3D body morphs to the shape that stands for it. */
export function ExpertiseChapters() {
  return (
    <div>
      {RESUME.expertise.map((e) => (
        <article
          key={e.title}
          data-stage={e.shape}
          data-side="1"
          data-dim="0.1"
          className="flex min-h-[78svh] flex-col justify-end gap-5 py-12 sm:justify-center sm:py-16"
        >
          <h3 data-split className="max-w-[12ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.025em]">
            {e.title}
          </h3>
          <p data-reveal className="max-w-[40ch] text-lg leading-relaxed text-dim sm:max-w-[34ch]">
            {e.summary}
          </p>
        </article>
      ))}
    </div>
  );
}
