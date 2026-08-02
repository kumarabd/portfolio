import type { HealthStatus } from "@mespace/core";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      data-testid="health-status-badge"
      style={{
        display: "inline-block",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "12px 24px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      API status: {status.status}
    </span>
  );
}
