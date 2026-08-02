import type { HealthStatus } from "@mespace/core";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return <span data-testid="health-status-badge">API status: {status.status}</span>;
}
