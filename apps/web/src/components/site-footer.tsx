import Link from "next/link";
import { PROFILE } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline px-5 py-8 text-sm text-dim sm:px-10">
      <span>
        &copy; {new Date().getFullYear()} {PROFILE.name}
      </span>
      <div className="flex flex-wrap items-center gap-6">
        {PROFILE.socialLinks.map((link) => (
          <a key={link.url} href={link.url} className="transition-colors hover:text-bone">
            {link.label}
          </a>
        ))}
        <Link href="/workspace" className="transition-colors hover:text-bone">
          Workspace
        </Link>
      </div>
    </footer>
  );
}
