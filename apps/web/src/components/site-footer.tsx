import Link from "next/link";
import { PROFILE } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-6 text-sm text-[var(--color-secondary)] sm:px-6">
      <span>
        <span className="text-[var(--color-border)]">#</span> {new Date().getFullYear()} {PROFILE.name} &middot;
        powered by MeSpace
      </span>
      <div className="flex items-center gap-4">
        {PROFILE.socialLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            className="no-underline transition-colors hover:text-[var(--color-accent)]"
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/workspace"
          className="text-[var(--color-secondary)] no-underline transition-colors hover:text-[var(--color-primary)]"
        >
          <span className="text-[var(--color-border)]">$</span> cd ../workspace
        </Link>
      </div>
    </footer>
  );
}
