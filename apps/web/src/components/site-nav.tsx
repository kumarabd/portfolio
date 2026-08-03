"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE } from "@/content/profile";
import { Caret } from "@/components/terminal/typed-text";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/resume", label: "resume" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 px-3 py-3 backdrop-blur-md sm:justify-between sm:px-6 sm:py-4">
      <Link
        href="/"
        className="flex items-center gap-0.5 text-sm font-semibold tracking-tight text-[var(--color-foreground)] no-underline"
      >
        <span className="text-[var(--color-primary)]">{PROFILE.handle}</span>
        <span className="hidden text-[var(--color-secondary)] sm:inline">@site:~$</span>
        <Caret className="ml-0.5 text-[var(--color-primary)]" />
      </Link>

      <div className="flex items-center gap-0.5 text-sm sm:gap-1">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-md px-1.5 py-1.5 font-medium no-underline transition-colors sm:px-2.5",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-secondary)] hover:text-[var(--color-foreground)]",
              )}
            >
              <span className="text-[var(--color-border)]">[</span>
              {link.label}
              <span className="text-[var(--color-border)]">]</span>
            </Link>
          );
        })}

        <span className="mx-1 text-[var(--color-border)]" aria-hidden="true">
          |
        </span>

        <Link
          href="/workspace"
          aria-current={pathname === "/workspace" ? "page" : undefined}
          className="rounded-md px-1.5 py-1.5 font-medium text-[var(--color-accent)] no-underline transition-colors hover:text-[var(--color-primary)] sm:px-2.5"
        >
          <span className="text-[var(--color-border)]">[</span>
          workspace
          <span className="text-[var(--color-border)]">]</span>
        </Link>
      </div>
    </nav>
  );
}
