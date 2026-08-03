import Link from "next/link";
import { fetchProjects } from "@mespace/api-client";
import { PROFILE } from "@/content/profile";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await fetchProjects();
  const featuredProjects = projects.filter((p) => p.published).slice(0, 2);

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "var(--space-3xl) var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2xl)",
      }}
    >
      <section style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>{PROFILE.name}</h1>
        <p style={{ fontSize: "1.25rem", color: "var(--color-secondary)", margin: 0 }}>
          {PROFILE.headline}
        </p>
        <p style={{ margin: 0 }}>{PROFILE.bio}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-md)" }}>
          <a className="btn-primary" href={`mailto:${PROFILE.contactEmail}`}>
            Contact
          </a>
          {PROFILE.socialLinks.map((link) => (
            <a key={link.url} href={link.url} style={{ alignSelf: "center", fontWeight: 600 }}>
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h2 style={{ margin: 0 }}>Featured projects</h2>
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <Link href="/projects" style={{ fontWeight: 600 }}>
          View all projects &rarr;
        </Link>
      </section>
    </main>
  );
}
