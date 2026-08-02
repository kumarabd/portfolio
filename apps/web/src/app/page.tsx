import { fetchHealthStatus } from "@mespace/api-client";
import { HealthStatusBadge } from "@/components/health-status-badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const status = await fetchHealthStatus(
    process.env.BASE_URL ?? "http://localhost:3000",
  );

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--space-2xl)",
        gap: "var(--space-lg)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>MeSpace</h1>
      <HealthStatusBadge status={status} />
    </main>
  );
}
