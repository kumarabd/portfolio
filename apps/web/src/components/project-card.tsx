import type { Project } from "@mespace/core";
import { StatusDot } from "@/components/terminal/status-dot";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--glow-primary)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          {project.title}
        </h3>
        <StatusDot status={project.status} className="shrink-0 pt-0.5" />
      </div>

      <p className="m-0 text-sm leading-relaxed text-[var(--color-secondary)]">{project.description}</p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="inline-block text-xs font-medium text-[var(--color-accent)]">
            #{tag}
          </span>
        ))}
      </div>

      {(project.repoUrl || project.demoUrl) && (
        <div className="mt-auto flex gap-4 border-t border-[var(--color-border)] pt-3 text-sm">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-foreground)] no-underline transition-colors group-hover:text-[var(--color-primary)]"
            >
              <span className="text-[var(--color-border)]">$</span> repo
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-foreground)] no-underline transition-colors group-hover:text-[var(--color-primary)]"
            >
              <span className="text-[var(--color-border)]">$</span> demo
            </a>
          )}
        </div>
      )}
    </article>
  );
}
