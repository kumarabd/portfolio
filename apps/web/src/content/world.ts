// Everything the game world says. Facts come from the resume; hobbies are
// placeholders (flagged) until real ones are filled in.
import { RESUME } from "@/content/resume";

export type RealmId = "professional" | "hobby" | "fame";

export interface WorldEntry {
  id: string;
  realm: RealmId;
  title: string;
  meta?: string; // company / period / kind
  body: string[]; // short paragraphs or bullets
  placeholder?: boolean;
}

export const REALMS: { id: RealmId; name: string; tagline: string; intro: string }[] = [
  {
    id: "professional",
    name: "Professional",
    tagline: "What I build and where",
    intro: `${RESUME.expertise.map((e) => e.title).join(", ")}. The unglamorous layers that make intelligent systems trustworthy.`,
  },
  { id: "hobby", name: "Hobby", tagline: "Life off the clock", intro: "What I do when nobody is paging me. These slots are placeholders for now." },
  { id: "fame", name: "Hall of Fame", tagline: "Wins, in numbers", intro: "Results I'm proud of, mostly measured." },
];

export const ENTRIES: WorldEntry[] = [
  {
    id: "pro-pan-senior",
    realm: "professional",
    title: "Palo Alto Networks",
    meta: "Senior Staff Software Engineer · Oct 2024 – now",
    body: [
      "Designed and deployed an MCP Gateway that enforces authorization on agentic and LLM tool traffic (OAuth2/OIDC, OPA/Rego, full audit trail).",
      "Built an AI agent orchestration platform on Temporal that runs remediation agents for critical infrastructure incidents.",
      "Designed a gRPC tunnel system for dynamic service discovery across the fleet.",
    ],
  },
  {
    id: "pro-pan-staff",
    realm: "professional",
    title: "Palo Alto Networks",
    meta: "Staff Software Engineer · Nov 2023 – Oct 2024",
    body: [
      "Automated pipelines for firewall log parsing and high-volume ingestion (Go, OpenTelemetry Collector, Fluent Bit/Vector, Kafka, Loki/ClickHouse).",
      "Built observability controllers for config-driven drops and transforms of noisy telemetry.",
    ],
  },
  {
    id: "pro-layer5",
    realm: "professional",
    title: "Layer5",
    meta: "Senior Software Engineer · Oct 2020 – Jul 2021",
    body: [
      "Mentored interns building Meshery, an open source service mesh management plane.",
      "Wrote Kubernetes controllers, operators and Istio sidecar filters in Rust, hardened with WebAssembly.",
    ],
  },
  {
    id: "pro-bms",
    realm: "professional",
    title: "Bookmyshow",
    meta: "Site Reliability Engineer · Jul 2018 – Oct 2020",
    body: [
      "Built and ran telemetry systems for billions of metrics, logs and traces a day on Elasticsearch, Prometheus and Grafana.",
      "Wrote Terraform and Ansible modules that automated CI/CD pipeline creation.",
    ],
  },
  {
    id: "pro-edu",
    realm: "professional",
    title: "Education",
    meta: "Where I studied",
    body: RESUME_EDU(),
  },
  {
    id: "pro-toolbox",
    realm: "professional",
    title: "Toolbox",
    meta: "What I reach for",
    body: RESUME.skills.map((g) => `${g.label}: ${g.items.join(", ")}`),
  },
  { id: "hobby-1", realm: "hobby", title: "Off the clock", meta: "Placeholder", body: ["Tell me what goes here and I'll replace this card."], placeholder: true },
  { id: "hobby-2", realm: "hobby", title: "On repeat", meta: "Placeholder", body: ["Music, podcasts, whatever is playing. Replace me."], placeholder: true },
  { id: "hobby-3", realm: "hobby", title: "Out and about", meta: "Placeholder", body: ["Sport, travel, long walks. Replace me."], placeholder: true },
  { id: "hobby-4", realm: "hobby", title: "Side quests", meta: "Placeholder", body: ["Things built for fun, not for a roadmap. Replace me."], placeholder: true },
  { id: "hobby-5", realm: "hobby", title: "Currently reading", meta: "Placeholder", body: ["The book on the nightstand. Replace me."], placeholder: true },
  { id: "fame-mttr", realm: "fame", title: "Half the time to recovery", meta: "Palo Alto Networks", body: ["Cut mean time to resolve infrastructure incidents by 50% with Temporal-based remediation agents, automating dozens of resolutions a month."] },
  { id: "fame-query", realm: "fame", title: "45% faster queries", meta: "Palo Alto Networks", body: ["Log pipeline redesign improved query latency by 45%, shrank storage by 30% and cut dashboard build time by 60%."] },
  { id: "fame-noise", realm: "fame", title: "65% quieter logs", meta: "Palo Alto Networks", body: ["Config-driven drops and transforms removed 65% of log noise and trimmed telemetry spend."] },
  { id: "fame-mcp", realm: "fame", title: "MCP gateway in production", meta: "Palo Alto Networks", body: ["A production-grade security and observability layer for multi-agent systems at scale."] },
  { id: "fame-scale", realm: "fame", title: "Billions a day", meta: "Bookmyshow", body: ["Telemetry systems that handled billions of metrics, logs and traces every day."] },
  { id: "fame-mentor", realm: "fame", title: "Open source mentor", meta: "Layer5 · Meshery", body: ["Mentored interns shipping Meshery, an open source service mesh management plane."] },
  { id: "fame-awards", realm: "fame", title: "Awards & recognition", meta: "Placeholder", body: ["Add real awards here and this trophy becomes the centrepiece."], placeholder: true },
];

function RESUME_EDU() {
  return [
    "The University of Texas at Dallas: M.S. Software Engineering (2021 – 2023)",
    "Indian Institute of Technology, Indore: B.Eng. Electrical and Electronics (2014 – 2018)",
  ];
}

export const byRealm = (realm: RealmId) => ENTRIES.filter((e) => e.realm === realm);
export const entryById = (id: string) => ENTRIES.find((e) => e.id === id);
