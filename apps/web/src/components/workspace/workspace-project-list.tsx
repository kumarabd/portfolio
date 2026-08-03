import type { Project } from "@mespace/core";

export function WorkspaceProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      {projects.map((project) => (
        <li key={project.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {project.title}
            {!project.published && (
              <span className="badge" style={{ marginLeft: "var(--space-sm)" }}>
                unpublished
              </span>
            )}
          </span>
          <span className="badge">{project.status}</span>
        </li>
      ))}
    </ul>
  );
}
