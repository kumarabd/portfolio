import { fetchProjects } from "@mespace/api-client";
import { ProjectCard } from "@/components/project-card";

export default async function ProjectsPage() {
  const projects = (await fetchProjects()).filter((p) => p.published);

  return (
    <main data-stage="2" data-side="1" data-dim="0.45" className="px-5 pb-[14vh] pt-40 sm:px-10">
      <h1 data-split className="text-[clamp(3.25rem,11vw,6rem)] leading-[0.95] tracking-[-0.03em]">
        Projects
      </h1>
      <p data-reveal className="mb-16 mt-6 max-w-[40ch] text-lg text-dim">
        {projects.length} published &mdash; things I&rsquo;ve built and shipped.
      </p>
      <div data-reveal>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
