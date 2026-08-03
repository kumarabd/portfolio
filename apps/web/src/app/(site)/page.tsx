import Link from "next/link";
import type { Project } from "@mespace/core";
import { fetchGithubRepos, fetchHealthStatus, fetchProjects } from "@mespace/api-client";
import { PROFILE } from "@/content/profile";
import { ProjectCard } from "@/components/project-card";
import { HealthStatusBadge } from "@/components/health-status-badge";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import { TypedLines } from "@/components/terminal/typed-text";

// No route-level `dynamic` directive here on purpose: fetchHealthStatus
// opts itself out of caching (cache: "no-store"), which is enough to make
// this route render dynamically. fetchGithubRepos relies on its own
// hourly revalidate — forcing the whole route dynamic would have
// overridden that and hit GitHub's rate limit on every request.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default async function HomePage() {
  const [githubProjects, mockProjects, health] = await Promise.all([
    fetchGithubRepos(PROFILE.githubUsername, 4).catch(() => [] as Project[]),
    fetchProjects(),
    fetchHealthStatus(API_BASE_URL).catch(() => null),
  ]);
  const usingGithub = githubProjects.length > 0;
  const featuredProjects = usingGithub
    ? githubProjects.slice(0, 2)
    : mockProjects.filter((p) => p.published).slice(0, 2);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="sr-only">
        {PROFILE.name} — {PROFILE.role}
      </h1>
      <section className="flex flex-col gap-6">
        <TerminalWindow title={`${PROFILE.handle}@site: ~`}>
          <TypedLines
            className="text-sm leading-relaxed sm:text-base"
            lines={[
              { prompt: "$", text: "whoami" },
              {
                text: `${PROFILE.name} — ${PROFILE.role}`,
                className: "text-lg font-semibold text-[var(--color-foreground)] sm:text-2xl",
              },
              { prompt: "$", text: "cat about.md" },
              { text: PROFILE.headline, className: "text-[var(--color-foreground)]" },
              { text: PROFILE.bio, className: "text-[var(--color-secondary)]" },
              { prompt: "$", text: "echo $STATUS" },
              {
                text: `${PROFILE.availability} · ${PROFILE.location}`,
                className: "text-[var(--color-primary)]",
              },
            ]}
          />
        </TerminalWindow>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {PROFILE.socialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] no-underline transition-colors hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
              >
                {link.label}
              </a>
            ))}
            {health && <HealthStatusBadge status={health} />}
          </div>

          <a
            href={`mailto:${PROFILE.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] no-underline transition-transform hover:-translate-y-0.5"
          >
            Contact
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-sm font-semibold tracking-tight text-[var(--color-secondary)]">
          <span className="text-[var(--color-border)]">#</span> featured_projects
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {usingGithub ? (
          <a
            href={`https://github.com/${PROFILE.githubUsername}?tab=repositories`}
            className="self-start text-sm font-medium text-[var(--color-primary)] no-underline"
          >
            view all repos on GitHub &rarr;
          </a>
        ) : (
          <Link
            href="/projects"
            className="self-start text-sm font-medium text-[var(--color-primary)] no-underline"
          >
            view all projects &rarr;
          </Link>
        )}
      </section>
    </main>
  );
}
