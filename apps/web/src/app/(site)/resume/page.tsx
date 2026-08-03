import { RESUME } from "@/content/resume";

export default function ResumePage() {
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
      <div>
        <h1 style={{ margin: 0 }}>{RESUME.headline}</h1>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h2 style={{ margin: 0 }}>Experience</h2>
        {RESUME.workHistory.map((job) => (
          <article key={`${job.company}-${job.period}`} className="card">
            <h3 style={{ margin: "0 0 var(--space-xs) 0" }}>
              {job.role} &middot; {job.company}
            </h3>
            <p style={{ margin: "0 0 var(--space-sm) 0", color: "var(--color-secondary)" }}>
              {job.period}
            </p>
            <p style={{ margin: 0 }}>{job.summary}</p>
          </article>
        ))}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h2 style={{ margin: 0 }}>Skills</h2>
        <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
          {RESUME.skills.map((skill) => (
            <span key={skill} className="badge">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h2 style={{ margin: 0 }}>Education</h2>
        {RESUME.education.map((school) => (
          <article key={school.school} className="card">
            <h3 style={{ margin: "0 0 var(--space-xs) 0" }}>{school.degree}</h3>
            <p style={{ margin: 0, color: "var(--color-secondary)" }}>
              {school.school} &middot; {school.period}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
