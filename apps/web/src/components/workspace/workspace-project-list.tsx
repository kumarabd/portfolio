import type { Project } from "@mespace/core";

export function WorkspaceProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-[var(--color-foreground)] transition-all duration-200"
        >
          <span>
            {project.title}
            {!project.published && (
              <span className="ml-2 inline-block rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">
                unpublished
              </span>
            )}
          </span>
          <span className="inline-block rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">
            {project.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
