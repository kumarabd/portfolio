import { fetchProjects } from "@mespace/api-client";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const publishedProjects = projects.filter((p) => p.published);

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "var(--space-3xl) var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <h1 style={{ margin: 0 }}>Projects</h1>
      <div style={{ display: "grid", gap: "var(--space-md)" }}>
        {publishedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
