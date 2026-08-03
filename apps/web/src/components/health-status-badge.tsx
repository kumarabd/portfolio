import type { HealthStatus } from "@mespace/core";
import { cn } from "@/lib/utils";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const isOk = status.status === "ok";

  return (
    <span
      data-testid="health-status-badge"
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-secondary)]"
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", isOk ? "bg-emerald-400" : "bg-amber-400")}
      />
      API status: {status.status}
    </span>
  );
}
