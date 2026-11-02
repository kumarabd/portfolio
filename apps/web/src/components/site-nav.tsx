"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE } from "@/content/profile";
import { cn } from "@/lib/utils";

import { REALMS } from "@/content/world";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-nav fixed inset-x-0 top-0">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between px-5 py-5 sm:px-10"
      >
        <Link href="/" className="font-display text-2xl leading-none tracking-tight text-bone" aria-label={`${PROFILE.name}, home`}>
          {PROFILE.name.split(" ").map((w) => w[0]).join("")}
          <span className="text-signal">.</span>
        </Link>
        <ul className="m-0 flex list-none items-center gap-4 p-0 text-[13px] sm:gap-8 sm:text-sm">
          {REALMS.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                aria-current={pathname.startsWith(r.href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 py-2 transition-colors",
                  pathname.startsWith(r.href) ? "text-bone" : "text-dim hover:text-bone",
                )}
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div data-progress aria-hidden="true" className="h-px origin-left scale-x-0 bg-signal" />
    </header>
  );
}
