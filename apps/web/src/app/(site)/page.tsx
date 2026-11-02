import Link from "next/link";
import type { Project } from "@mespace/core";
import { fetchGithubRepos, fetchHealthStatus, fetchProjects } from "@mespace/api-client";
import { PROFILE } from "@/content/profile";
import { DeckMotion } from "@/components/deck-motion";
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

  const scene = "scene";
  const labels = ["Hello", "About", ...RESUME.expertise.map((e) => e.title), "Work", "Contact"];

  return (
    <main>
      <DeckMotion />
      <div data-deck className="deck">
        <div className="deck-pin">
          {/* Hello */}
          <section data-scene data-label={labels[0]} data-stage="0" data-side="1" className={scene}>
            <h1 className="m-0 text-[clamp(3.25rem,11vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              <span aria-hidden="true" data-chars className="block">
                {PROFILE.name}
              </span>
              <span className="sr-only">
                {PROFILE.name} — {PROFILE.role}
              </span>
            </h1>
            <p data-split data-delay="0.5" className="max-w-[24ch] font-display text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.2] text-dim">
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
            <div data-reveal className="data-label flex items-center gap-3 text-dim">
              <span>
                {PROFILE.role} &middot; {PROFILE.location}
              </span>
              <span className="scroll-line" aria-hidden="true" />
              <span>Scroll</span>
            </div>
          </section>

          {/* About */}
          <section data-scene data-label={labels[1]} data-stage="1" data-side="1" className={scene}>
            <p data-d className="max-w-[30ch] font-display text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.1] tracking-[-0.02em]">
              {PROFILE.bio}
            </p>
            <div data-d className="flex items-center gap-3 text-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              <span className="data-label">{PROFILE.availability}</span>
            </div>
          </section>

          {/* Expertise: one scene per area, the shape tells which */}
          {RESUME.expertise.map((e, i) => (
            <section key={e.title} data-scene data-label={labels[2 + i]} data-stage={e.shape} data-side="1" data-dim="0.1" className={scene}>
              <h2 data-d className="max-w-[12ch] text-[clamp(2.5rem,6.4vw,5rem)] leading-[0.98] tracking-[-0.025em]">
                {e.title}
              </h2>
              <p data-d className="max-w-[36ch] text-lg leading-relaxed text-dim">
                {e.summary}
              </p>
            </section>
          ))}

          {/* Work */}
          <section data-scene data-label={labels[labels.length - 2]} data-stage="2" data-side="1" data-dim="0.15" className={scene}>
            <div data-d className="flex items-end justify-between gap-6 sm:max-w-[46rem]">
              <h2 className="text-[clamp(2.25rem,5.4vw,4rem)] leading-none tracking-[-0.02em]">Selected work</h2>
              {usingGithub ? (
                <a
                  href={`https://github.com/${PROFILE.githubUsername}?tab=repositories`}
                  className="data-label pb-1 text-dim transition-colors hover:text-bone"
                >
                  All repos &#8599;
                </a>
              ) : (
                <Link href="/projects" className="data-label pb-1 text-dim transition-colors hover:text-bone">
                  All projects &rarr;
                </Link>
              )}
            </div>
            <div data-d className="sm:max-w-[46rem]">
              {featured.map((project) => (
                <ProjectCard key={project.id} project={project} compact />
              ))}
            </div>
          </section>

          {/* Contact */}
          <section data-scene data-label={labels[labels.length - 1]} data-stage="6" data-side="1" className={scene}>
            <h2 data-d className="max-w-[14ch] text-[clamp(2.75rem,8.4vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              Let&rsquo;s build something small and sharp.
            </h2>
            <a
              data-d
              data-magnetic
              data-excite
              href={`mailto:${PROFILE.contactEmail}`}
              className="w-fit break-all border-b border-signal pb-1 font-display text-[clamp(1.25rem,4vw,2.75rem)] text-signal transition-colors hover:text-bone"
            >
              {PROFILE.contactEmail}
            </a>
            {health && (
              <div data-d>
                <HealthStatusBadge status={health} />
              </div>
            )}
          </section>

          <nav className="deck-rail" aria-label="Sections">
            {labels.map((l) => (
              <button key={l} type="button" data-goto aria-label={l} className="deck-dot" />
            ))}
            <span data-rail-label className="data-label text-dim" aria-hidden="true" />
          </nav>
        </div>
      </div>
    </main>
  );
}
