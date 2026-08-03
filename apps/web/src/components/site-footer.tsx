import Link from "next/link";
import { PROFILE } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-lg) var(--space-md)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-secondary)",
        fontSize: "0.875rem",
      }}
    >
      <span>
        &copy; {new Date().getFullYear()} {PROFILE.name}
      </span>
      <Link href="/workspace" style={{ textDecoration: "none" }}>
        Workspace
      </Link>
    </footer>
  );
}
