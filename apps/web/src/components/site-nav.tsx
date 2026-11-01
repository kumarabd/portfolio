"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE } from "@/content/profile";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/resume", label: "About" },
];

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
        <ul className="m-0 flex list-none items-center gap-5 p-0 text-sm sm:gap-8">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "py-2 transition-colors",
                  pathname === link.href ? "text-bone" : "text-dim hover:text-bone",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div data-progress aria-hidden="true" className="h-px origin-left scale-x-0 bg-signal" />
    </header>
  );
}
