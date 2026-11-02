// What the three worlds say. Facts come from the resume; hobbies are
// placeholders (flagged) until real ones are filled in.
import { SHAPE } from "@/components/scene/shapes";

export type RealmId = "professional" | "hobby" | "fame";

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
    id: "hobby",
    name: "Hobby",
    href: "/hobby",
    tagline: "Life off the clock",
    intro: "What I do when nobody is paging me.",
    color: "#ff8f6b",
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
    shape: SHAPE.net,
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
    shape: SHAPE.wheel,
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
    shape: SHAPE.pulse,
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

/** Placeholders: every one says so on stage until real entries replace it. */
export const AWARDS = [
  { title: "An award", note: "Name, year and why it was given." },
  { title: "Another one", note: "Name, year and why it was given." },
  { title: "A recognition", note: "Name, year and why it was given." },
];
export const PRESS = [
  { title: "A podcast", note: "Show, episode and what we talked about." },
  { title: "A newspaper feature", note: "Publication, headline and the story." },
  { title: "A conference talk", note: "Event, title and the room." },
];

export const HOBBIES = [
  {
    id: "hikes",
    label: "Hikes",
    shape: SHAPE.peaks,
    tiles: [
      { title: "A favourite trail", note: "The name, the place and the view." },
      { title: "The hard one", note: "Distance, elevation and how it went." },
      { title: "Next on the list", note: "Where to, and when." },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    shape: SHAPE.globe,
    tiles: [
      { title: "A place that stuck", note: "Where, when and why it stayed." },
      { title: "A long journey", note: "The route and the stops." },
      { title: "Somewhere to go", note: "The next stamp." },
    ],
  },
  {
    id: "movies",
    label: "Movies",
    shape: SHAPE.reel,
    tiles: [
      { title: "An all-time favourite", note: "The film and why it holds up." },
      { title: "Recently watched", note: "What was on last weekend." },
      { title: "Watch-list", note: "Queued up and waiting." },
    ],
  },
  {
    id: "music",
    label: "On repeat",
    shape: SHAPE.pulse,
    tiles: [
      { title: "A record", note: "The album that's always on." },
      { title: "A podcast", note: "What fills the commute." },
      { title: "A playlist", note: "Built for deep work." },
    ],
  },
];
