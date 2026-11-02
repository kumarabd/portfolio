import type { Project, ProjectStatus } from "@mespace/core";

const STATUS: Record<ProjectStatus, string> = { done: "Shipped", "in-progress": "In progress", idea: "Idea" };

/** A project as a full-width row: title leads, everything else is data. */
export function ProjectCard({ project }: { project: Project }) {
  const href = project.repoUrl ?? project.demoUrl;
  const body = (
    <article className="grid gap-x-8 gap-y-3 px-1 py-8 sm:grid-cols-[1fr_auto] sm:py-10">
      <div className="flex flex-col gap-3">
        <h3 className="row-title text-4xl leading-none tracking-tight sm:text-6xl">{project.title}</h3>
        <p className="max-w-[56ch] text-base leading-relaxed text-dim">{project.description}</p>
        <div className="data-label flex flex-wrap gap-x-4 gap-y-1 text-dim">
          {project.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
      <div className="data-label flex items-start gap-3 text-dim sm:flex-col sm:items-end sm:text-right">
        <span data-scramble className="text-bone">{STATUS[project.status]}</span>
        {href && <span aria-hidden="true">Open &#8599;</span>}
      </div>
    </article>
  );

  return href ? (
    <a href={href} data-excite className="row-link">
      {body}
    </a>
  ) : (
    <div data-excite className="row-link">
      {body}
    </div>
  );
}
