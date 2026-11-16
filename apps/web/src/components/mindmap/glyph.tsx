import {
  Activity, BookOpen, Brain, Cloud, Code, Database, Flag, GraduationCap, Layers,
  Shield, TrendingUp, Wrench, type LucideIcon,
} from "lucide-react";
import {
  siApachekafka, siArgo, siBookmyshow, siClickhouse, siCplusplus, siDocker, siElasticsearch, siFluentbit,
  siGithub, siGithubactions, siGitlab, siGmail, siGo, siGooglecloud, siGrafana, siHelm, siIstio, siJsonwebtokens,
  siKubernetes, siModelcontextprotocol, siNatsdotio, siOpenid, siOpenjdk, siOpentelemetry, siPaloaltonetworks,
  siPostgresql, siPrometheus, siPython, siQdrant, siRedis, siRust, siTemporal, siTerraform, siTypescript, siVault,
  siWebassembly, siAnsible,
  type SimpleIcon,
} from "simple-icons";

type Spec = { brand: { path: string; hex: string } } | { lucide: LucideIcon } | { custom: string };
const brand = (i: SimpleIcon): Spec => ({ brand: { path: i.path, hex: `#${i.hex}` } });

// LinkedIn is not in simple-icons any more: authored mark, same 24px grid.
const LINKEDIN = "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z";

/** Logos for named things, keyed by node id. Anything absent shows no icon. */
const NODE: Record<string, Spec> = {
  "professional.palo-alto-networks": brand(siPaloaltonetworks),
  "professional.bookmyshow": brand(siBookmyshow),
  "professional.layer5": { lucide: Layers },
  "professional.expertise": { lucide: Brain },
  "professional.expertise.ai-infrastructure": { lucide: Brain },
  "professional.expertise.security-policy": { lucide: Shield },
  "professional.expertise.observability": { lucide: Activity },
  "professional.expertise.cloud-native-systems": { lucide: Cloud },
  "professional.toolbox": { lucide: Wrench },
  "professional.toolbox.languages": { lucide: Code },
  "professional.toolbox.kubernetes-cloud": { lucide: Cloud },
  "professional.toolbox.observability": { lucide: Activity },
  "professional.toolbox.security-policy": { lucide: Shield },
  "professional.toolbox.data-streaming": { lucide: Database },
  "writing": { lucide: BookOpen },
  "fame.schools": { lucide: GraduationCap },
  "fame.impact": { lucide: TrendingUp },
  "fame.milestones": { lucide: Flag },
  "contact.github": brand(siGithub),
  "contact.linkedin": { custom: LINKEDIN },
  "contact.email": brand(siGmail),
};

/** Logos for tools and languages, keyed by the tag text. */
const TAG: Record<string, SimpleIcon> = {
  go: siGo, java: siOpenjdk, python: siPython, "typescript/javascript": siTypescript, rust: siRust, "c/c++": siCplusplus,
  postgresql: siPostgresql, redis: siRedis, kubernetes: siKubernetes, helm: siHelm, "argo cd": siArgo,
  "istio/envoy": siIstio, istio: siIstio, terraform: siTerraform, ansible: siAnsible, "containerd/docker": siDocker, gcp: siGooglecloud,
  "github actions/gitlab ci": siGithubactions, "temporal/argo workflows": siTemporal, temporal: siTemporal,
  opentelemetry: siOpentelemetry, prometheus: siPrometheus, grafana: siGrafana, clickhouse: siClickhouse,
  fluentbit: siFluentbit, elasticsearch: siElasticsearch, kafka: siApachekafka, nats: siNatsdotio,
  "qdrant/pgvector": siQdrant, "oauth2/oidc": siOpenid, jwt: siJsonwebtokens, "hashicorp vault": siVault,
  "mcp gateway": siModelcontextprotocol, mcp: siModelcontextprotocol, webassembly: siWebassembly, gitlab: siGitlab,
};

export const hasGlyph = (id: string) => id in NODE;

/** Brand colours that would vanish on paper fall back to ink. */
const readable = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l > 0.1 && l < 0.62 ? hex : "#1c1a24";
};

function Svg({ path, size, color }: { path: string; size: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={color ? { color } : undefined} aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export function NodeGlyph({ id, size = 18, colored }: { id: string; size?: number; colored?: boolean }) {
  const s = NODE[id];
  if (!s) return null;
  if ("lucide" in s) return <s.lucide size={size} strokeWidth={2} aria-hidden="true" />;
  if ("custom" in s) return <Svg path={s.custom} size={size} color={colored ? "#0a66c2" : undefined} />;
  return <Svg path={s.brand.path} size={size} color={colored ? readable(s.brand.hex) : undefined} />;
}

export function TagGlyph({ tag }: { tag: string }) {
  const i = TAG[tag.toLowerCase()];
  return i ? <Svg path={i.path} size={14} color={readable(`#${i.hex}`)} /> : null;
}
