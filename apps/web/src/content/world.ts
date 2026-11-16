// What the worlds say. Facts come from the resume.

export type RealmId = "professional" | "fame";

export interface Realm {
  id: RealmId;
  name: string;
  href: string;
  tagline: string;
  intro: string;
  /** The realm's colour: shapes and accents wear it, the theme stays slate. */
  color: string;
}

export const REALMS: Realm[] = [
  {
    id: "professional",
    name: "Professional",
    href: "/professional",
    tagline: "What I build, and where",
    intro: "AI infrastructure, security and observability: the unglamorous layers that make intelligent systems trustworthy.",
    color: "#6fd3ff",
  },
  {
    id: "fame",
    name: "Hall of Fame",
    href: "/hall-of-fame",
    tagline: "Wins, in numbers",
    intro: "Results I'm proud of, mostly measured.",
    color: "#f2c14e",
  },
];

export const realm = (id: RealmId) => REALMS.find((r) => r.id === id)!;

export const COMPANIES = [
  {
    name: "Palo Alto Networks",
    location: "Santa Clara, CA",
    roles: [
      { title: "Senior Staff Software Engineer", period: "Oct 2024 – Present" },
      { title: "Staff Software Engineer", period: "Nov 2023 – Oct 2024" },
    ],
    highlights: [
      "An MCP Gateway that enforces authorization on agentic and LLM tool traffic, with OAuth2/OIDC, OPA/Rego policy and a full audit trail.",
      "A Temporal-based agent platform that remediates infrastructure incidents, cutting MTTR by 50%.",
      "Log pipelines and telemetry controllers: 45% faster queries and 65% less noise.",
    ],
    stack: ["Go", "Temporal", "OpenTelemetry", "Kafka", "ClickHouse", "Loki", "OPA/Rego", "OAuth2/OIDC", "gRPC", "MCP"],
  },
  {
    name: "Layer5",
    location: "Austin, TX (Remote)",
    roles: [{ title: "Senior Software Engineer", period: "Oct 2020 – Jul 2021" }],
    highlights: [
      "Mentored interns building Meshery, an open source service mesh management plane.",
      "Kubernetes controllers, operators and Istio sidecar filters in Rust, hardened with WebAssembly.",
    ],
    stack: ["Rust", "Kubernetes", "Istio", "WebAssembly", "Meshery"],
  },
  {
    name: "Bookmyshow",
    location: "Mumbai, India",
    roles: [{ title: "Site Reliability Engineer", period: "Jul 2018 – Oct 2020" }],
    highlights: [
      "Telemetry systems for billions of metrics, logs and traces a day.",
      "Terraform and Ansible modules that automated CI/CD pipeline creation.",
    ],
    stack: ["Elasticsearch", "Prometheus", "Grafana", "Terraform", "Ansible"],
  },
];

export const SCHOOLS = [
  { name: "The University of Texas at Dallas", degree: "M.S. Software Engineering", period: "2021 – 2023", place: "Dallas, TX" },
  { name: "Indian Institute of Technology", degree: "B.Eng. Electrical and Electronics", period: "2014 – 2018", place: "Indore, India" },
];

/** Measured results from the resume: they count up on stage. */
export const IMPACT = [
  { num: 50, suffix: "%", label: "Faster incident recovery", detail: "MTTR, with Temporal remediation agents" },
  { num: 45, suffix: "%", label: "Faster log queries", detail: "Automated parsing and ingestion pipelines" },
  { num: 60, suffix: "%", label: "Faster dashboard builds", detail: "Firewall logs normalised at ingestion" },
  { num: 65, suffix: "%", label: "Less log noise", detail: "Config-driven drops and transforms" },
];

export const MILESTONES = [
  { title: "MCP gateway in production", where: "Palo Alto Networks", detail: "A production-grade security and observability layer for multi-agent systems at scale." },
  { title: "Billions of signals a day", where: "Bookmyshow", detail: "Telemetry systems for billions of metrics, logs and traces every day." },
  { title: "Open source mentor", where: "Layer5 · Meshery", detail: "Mentored interns shipping an open source service mesh management plane." },
];
