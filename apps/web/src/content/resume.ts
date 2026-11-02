// Who I am, what I like, what I'm good at. No employer history on purpose.
export const RESUME = {
  headline: "A software engineer drawn to the unglamorous layers that make intelligent systems trustworthy.",
  expertise: [
    {
      title: "AI infrastructure",
      stack: ["MCP Gateway", "Temporal", "gRPC", "Qdrant/pgvector"],
      shape: 0, // scene shape id (see components/scene/shapes.ts)
      summary: "The plumbing under agents and LLM apps: orchestration, tool access, guardrails, and the reliability that lets them run unattended.",
    },
    {
      title: "Security & policy",
      stack: ["OPA/Rego", "OAuth2/OIDC", "SPIFFE/SPIRE", "OpenFGA", "HashiCorp Vault"],
      shape: 3, // scene shape id (see components/scene/shapes.ts)
      summary: "Authorization that is explicit and auditable. Identity, least privilege, and policy-as-code instead of rules buried in application logic.",
    },
    {
      title: "Observability",
      stack: ["OpenTelemetry", "Prometheus", "Grafana", "Loki", "ClickHouse"],
      shape: 4, // scene shape id (see components/scene/shapes.ts)
      summary: "Turning billions of signals into answers: telemetry pipelines, sane cardinality, and dashboards people actually trust.",
    },
    {
      title: "Cloud-native systems",
      stack: ["Kubernetes", "Istio/Envoy", "Argo CD", "Helm", "Terraform"],
      shape: 5, // scene shape id (see components/scene/shapes.ts)
      summary: "Kubernetes, service meshes and GitOps. Systems that deploy the same way every time and fail in boring, recoverable ways.",
    },
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
