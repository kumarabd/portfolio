import type { HealthStatus } from "@mespace/core";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      data-testid="health-status-badge"
      style={{
        display: "inline-block",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
        border: "1px solid var(--color-accent)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      API status: {status.status}
    </span>
  );
}
