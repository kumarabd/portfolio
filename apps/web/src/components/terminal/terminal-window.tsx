import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TerminalWindow({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]",
        "shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/70" />
        </div>
        <span className="ml-1 truncate text-xs text-[var(--color-secondary)]">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
