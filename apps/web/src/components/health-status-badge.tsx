import type { HealthStatus } from "@mespace/core";
import { cn } from "@/lib/utils";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const isOk = status.status === "ok";

  return (
    <span
      data-testid="health-status-badge"
      className="data-label inline-flex items-center gap-2 text-dim"
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", isOk ? "bg-oil" : "bg-signal")}
      />
      API status: {status.status}
    </span>
  );
}
