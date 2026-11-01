import Link from "next/link";
import type { Project } from "@mespace/core";
import { fetchGithubRepos, fetchHealthStatus, fetchProjects } from "@mespace/api-client";
import { PROFILE } from "@/content/profile";
import { RESUME } from "@/content/resume";
import { ProjectCard } from "@/components/project-card";
import { HealthStatusBadge } from "@/components/health-status-badge";

// No route-level `dynamic` directive on purpose: fetchHealthStatus opts itself
// out of caching (cache: "no-store"), enough to render dynamically.
// fetchGithubRepos relies on its own hourly revalidate — forcing the whole
// route dynamic would override that and hit GitHub's rate limit.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default async function HomePage() {
  const [githubProjects, mockProjects, health] = await Promise.all([
    fetchGithubRepos(PROFILE.githubUsername, 4).catch(() => [] as Project[]),
    fetchProjects(),
    fetchHealthStatus(API_BASE_URL).catch(() => null),
  ]);
  const usingGithub = githubProjects.length > 0;
  const featured = usingGithub ? githubProjects.slice(0, 3) : mockProjects.filter((p) => p.published).slice(0, 3);
  const focus = PROFILE.focusAreas;

  return (
    <main>
      {/* Hero */}
      <section data-stage="0" data-side="1" className="relative flex min-h-svh flex-col justify-end px-5 pb-10 pt-32 sm:px-10">
        <div data-fade-out className="flex max-w-[1100px] flex-col gap-8">
          <h1 className="m-0 text-[clamp(3.25rem,11vw,6rem)] leading-[0.95] tracking-[-0.03em]">
            <span aria-hidden="true" data-chars className="block">
              {PROFILE.name}
            </span>
            <span className="sr-only">
              {PROFILE.name} — {PROFILE.role}
            </span>
          </h1>
          <p
            data-split
            data-delay="0.5"
            className="max-w-[24ch] font-display text-[clamp(1.5rem,3.4vw,2.5rem)] italic leading-[1.15] text-dim"
          >
            {PROFILE.headline}
          </p>
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${PROFILE.contactEmail}`} data-magnetic className="btn-solid">
              Say hello <span aria-hidden="true">&rarr;</span>
            </a>
            <Link href="/projects" className="btn-ghost">
              See the work
            </Link>
          </div>
        </div>
        <div data-reveal className="data-label mt-14 flex items-end justify-between gap-6 text-dim">
          <span>
            {PROFILE.role} &middot; {PROFILE.location}
          </span>
          <span className="hidden items-center gap-3 sm:flex">
            Scroll to travel <span className="scroll-line" aria-hidden="true" />
          </span>
        </div>
      </section>

      {/* About */}
      <section data-stage="1" data-side="1" className="px-5 py-[22vh] sm:px-10">
        <p
          data-words
          className="max-w-[30ch] font-display text-[clamp(2rem,4.8vw,3.75rem)] leading-[1.1] tracking-[-0.02em]"
        >
          {PROFILE.bio}
        </p>
        <div data-reveal className="mt-10 flex items-center gap-3 text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          <span className="data-label">{PROFILE.availability}</span>
        </div>
      </section>

      {/* Work */}
      <section data-stage="2" data-side="1" data-dim="0.5" className="px-5 pb-[18vh] sm:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 data-split className="text-[clamp(2.5rem,7vw,5rem)] leading-none tracking-[-0.02em]">
            Selected work
          </h2>
          {usingGithub ? (
            <a
              data-reveal
              href={`https://github.com/${PROFILE.githubUsername}?tab=repositories`}
              className="data-label pb-2 text-dim transition-colors hover:text-bone"
            >
              All repos &#8599;
            </a>
          ) : (
            <Link data-reveal href="/projects" className="data-label pb-2 text-dim transition-colors hover:text-bone">
              All projects &rarr;
            </Link>
          )}
        </div>
        <div data-reveal>
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Expertise */}
      <section data-stage="3" data-side="0" data-dim="0.6" className="px-5 pb-[18vh] sm:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 data-split className="text-[clamp(2.5rem,7vw,5rem)] leading-none tracking-[-0.02em]">
            Expertise
          </h2>
          <Link data-reveal href="/resume" className="data-label pb-2 text-dim transition-colors hover:text-bone">
            More about me &rarr;
          </Link>
        </div>
        <div data-reveal>
          {RESUME.expertise.map((e) => (
            <Link key={e.title} href="/resume" data-excite className="row-link">
              <div className="grid gap-x-8 gap-y-3 px-1 py-7 sm:grid-cols-[1fr_1fr] sm:items-baseline">
                <span className="row-title font-display text-3xl leading-none sm:text-5xl">{e.title}</span>
                <span className="max-w-[48ch] leading-relaxed text-dim">{e.summary}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Focus marquee */}
      <section aria-label="Focus areas" className="overflow-hidden border-y border-hairline py-8">
        <div data-marquee className="flex w-max gap-12 whitespace-nowrap font-display text-[clamp(2.5rem,7vw,5rem)] leading-none">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="m-0 flex list-none gap-12 p-0">
              {[...focus, ...focus].map((f, i) => (
                <li key={`${f}-${i}`} className="flex items-center gap-12">
                  <span className={i % 2 ? "italic text-signal" : ""}>{f}</span>
                  <span className="text-hairline" aria-hidden="true">&#10022;</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section data-stage="4" data-side="1" className="flex min-h-[80svh] flex-col justify-center gap-10 px-5 py-[14vh] sm:px-10">
        <h2 data-split className="max-w-[14ch] text-[clamp(3rem,10vw,6rem)] leading-[0.95] tracking-[-0.03em]">
          Let&rsquo;s build something small and sharp.
        </h2>
        <a
          data-reveal
          data-magnetic
          data-excite
          href={`mailto:${PROFILE.contactEmail}`}
          className="w-fit break-all border-b border-signal pb-1 font-display text-[clamp(1.5rem,4.4vw,3rem)] italic text-signal transition-colors hover:text-bone"
        >
          {PROFILE.contactEmail}
        </a>
        {health && (
          <div data-reveal>
            <HealthStatusBadge status={health} />
          </div>
        )}
      </section>
    </main>
  );
}
