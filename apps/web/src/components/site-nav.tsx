import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
];

export function SiteNav() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-lg)",
        padding: "var(--space-lg) var(--space-md)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} style={{ fontWeight: 600, textDecoration: "none" }}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
