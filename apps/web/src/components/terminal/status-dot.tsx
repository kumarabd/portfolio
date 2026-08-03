import type { ProjectStatus } from "@mespace/core";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ProjectStatus, { label: string; dot: string; text: string }> = {
  done: { label: "shipped", dot: "bg-emerald-400", text: "text-emerald-400" },
  "in-progress": { label: "in progress", dot: "bg-sky-400", text: "text-sky-400" },
  idea: { label: "idea", dot: "bg-amber-400", text: "text-amber-400" },
};

export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
