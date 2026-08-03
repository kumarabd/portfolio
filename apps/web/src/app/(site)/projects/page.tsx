import { fetchProjects } from "@mespace/api-client";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const publishedProjects = projects.filter((p) => p.published);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
          <span className="text-[var(--color-primary)]">$</span> ls ~/projects
        </h1>
        <p className="m-0 text-[var(--color-secondary)]">{publishedProjects.length} published — things I&rsquo;ve built and shipped.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {publishedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
