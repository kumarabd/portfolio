import type { RealmId } from "@/content/world";

/** Small line icons, one per world. They inherit the realm colour via currentColor. */
export function RealmIcon({ id, className }: { id: RealmId; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={className} {...common}>
      {id === "professional" && (
        <>
          <rect x="3" y="3.5" width="18" height="5" rx="1" />
          <rect x="3" y="9.5" width="18" height="5" rx="1" />
          <rect x="3" y="15.5" width="18" height="5" rx="1" />
          <path d="M6.5 6h2M6.5 12h2M6.5 18h2M16.5 6h.01M16.5 12h.01M16.5 18h.01" />
        </>
      )}
      {id === "hobby" && (
        <>
          <rect x="3" y="14" width="6" height="6" rx="0.5" />
          <rect x="9" y="14" width="6" height="6" rx="0.5" />
          <rect x="15" y="14" width="6" height="6" rx="0.5" />
          <rect x="3" y="8" width="6" height="6" rx="0.5" />
          <rect x="9" y="8" width="6" height="6" rx="0.5" />
          <rect x="3" y="2" width="6" height="6" rx="0.5" />
        </>
      )}
      {id === "fame" && (
        <>
          <path d="M8 3h8v6a4 4 0 0 1-8 0V3Z" />
          <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10" />
          <path d="M12 13v4M8.5 21h7M9.5 21v-2.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21" />
        </>
      )}
    </svg>
  );
}
