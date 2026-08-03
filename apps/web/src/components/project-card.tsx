import type { Project } from "@mespace/core";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card">
      <h3 style={{ margin: "0 0 var(--space-sm) 0" }}>{project.title}</h3>
      <p style={{ margin: "0 0 var(--space-md) 0", color: "var(--color-secondary)" }}>
        {project.description}
      </p>
      <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
        {project.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          style={{ display: "inline-block", marginTop: "var(--space-md)", fontWeight: 600 }}
        >
          View repo &rarr;
        </a>
      )}
    </article>
  );
}
