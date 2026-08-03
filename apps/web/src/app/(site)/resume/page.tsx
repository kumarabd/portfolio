import { RESUME } from "@/content/resume";

export default function ResumePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="m-0 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
        <span className="text-[var(--color-primary)]">$</span> cat resume.md
      </h1>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-sm font-semibold tracking-tight text-[var(--color-secondary)]">
          <span className="text-[var(--color-border)]">#</span> experience
        </h2>
        <div className="flex flex-col gap-4">
          {RESUME.workHistory.map((job) => (
            <article
              key={`${job.company}-${job.period}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="m-0 text-base font-semibold text-[var(--color-foreground)]">
                  {job.role} <span className="text-[var(--color-secondary)]">&middot; {job.company}</span>
                </h3>
                <p className="m-0 text-xs font-medium text-[var(--color-accent)]">{job.period}</p>
              </div>
              <p className="m-0 mt-2 text-sm leading-relaxed text-[var(--color-secondary)]">{job.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-sm font-semibold tracking-tight text-[var(--color-secondary)]">
          <span className="text-[var(--color-border)]">#</span> skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {RESUME.skills.map((skill) => (
            <span
              key={skill}
              className="inline-block rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-foreground)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-sm font-semibold tracking-tight text-[var(--color-secondary)]">
          <span className="text-[var(--color-border)]">#</span> education
        </h2>
        <div className="flex flex-col gap-4">
          {RESUME.education.map((school) => (
            <article
              key={school.school}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-6"
            >
              <h3 className="m-0 text-base font-semibold text-[var(--color-foreground)]">{school.degree}</h3>
              <p className="m-0 mt-1 text-sm text-[var(--color-secondary)]">
                {school.school} &middot; {school.period}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
