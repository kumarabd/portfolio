import Link from "next/link";
import { fetchProjects } from "@mespace/api-client";
import { ProjectCard } from "@/components/project-card";

export default async function ProjectsPage() {
  const projects = (await fetchProjects()).filter((p) => p.published);

  return (
    <main className="doc">
      <Link href="/" className="back-link">&larr; Back to the map</Link>
      <h1>Projects</h1>
      <p className="lede">{projects.length} published: things I&rsquo;ve built and shipped.</p>
      <div>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
