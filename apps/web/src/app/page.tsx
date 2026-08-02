import { fetchHealthStatus } from "@mespace/api-client";
import { HealthStatusBadge } from "@/components/health-status-badge";

export default async function HomePage() {
  const status = await fetchHealthStatus(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  );

  return (
    <main>
      <h1>MeSpace</h1>
      <HealthStatusBadge status={status} />
    </main>
  );
}
