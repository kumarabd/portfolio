// Who I am, what I like, what I'm good at. No employer history on purpose.
export const RESUME = {
  headline: "A software engineer drawn to the unglamorous layers that make intelligent systems trustworthy.",
  expertise: [
    {
      title: "AI infrastructure",
      summary: "The plumbing under agents and LLM apps: orchestration, tool access, guardrails, and the reliability that lets them run unattended.",
    },
    {
      title: "Security & policy",
      summary: "Authorization that is explicit and auditable. Identity, least privilege, and policy-as-code instead of rules buried in application logic.",
    },
    {
      title: "Observability",
      summary: "Turning billions of signals into answers: telemetry pipelines, sane cardinality, and dashboards people actually trust.",
    },
    {
      title: "Cloud-native systems",
      summary: "Kubernetes, service meshes and GitOps. Systems that deploy the same way every time and fail in boring, recoverable ways.",
    },
  ],
  likes: [
    "Small tools with sharp edges and honest interfaces",
    "Making complex systems legible",
    "Open source and learning in public",
    "Mentoring, and explaining things plainly",
    "Craft in the details: motion, type, and the feel of software",
  ],
  skills: [
    { label: "Languages", items: ["Go", "Java", "Python", "TypeScript/JavaScript", "Rust", "C/C++", "SQL"] },
    {
      label: "Kubernetes & Cloud",
      items: ["Kubernetes", "Helm", "Argo CD", "Istio/Envoy", "Terraform", "containerd/Docker", "AWS", "GCP", "GitHub Actions/GitLab CI", "Temporal/Argo Workflows"],
    },
    {
      label: "Observability",
      items: ["OpenTelemetry", "Prometheus", "Grafana", "Loki", "Tempo", "ClickHouse", "Vector", "FluentBit", "Mimir", "Elasticsearch"],
    },
    {
      label: "Security & Policy",
      items: ["NGAC (JIT access)", "OPA/Rego", "CEL", "OpenFGA", "OAuth2/OIDC", "JWT", "SPIFFE/SPIRE", "HashiCorp Vault", "MCP Gateway"],
    },
    { label: "Data & Streaming", items: ["PostgreSQL", "Redis", "eBPF", "ClickHouse", "Elasticsearch", "Kafka", "NATS", "Qdrant/pgvector"] },
  ],
};
