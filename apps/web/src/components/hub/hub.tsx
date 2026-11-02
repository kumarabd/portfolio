"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PROFILE } from "@/content/profile";
import { REALMS, type RealmId } from "@/content/world";
import { RealmIcon } from "@/components/realm-icon";
import { signal } from "@/components/scene/signal";

/**
 * The front door. Three worlds float in one 3D scene; each is a real link.
 * Hover or focus one to wake it, click to fly in. Everything else lives on
 * the world's own page.
 */
export function Hub() {
  const host = useRef<HTMLDivElement>(null);
  const links = useRef<Partial<Record<RealmId, HTMLAnchorElement | null>>>({});

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let off: (() => void) | undefined;
    signal.paused = true;
    import("./hub-engine")
      .then(({ createHub }) => {
        if (dead) return;
        const hub = createHub(el, {
          links: links.current as Record<RealmId, HTMLAnchorElement>,
          colors: Object.fromEntries(REALMS.map((r) => [r.id, r.color])) as Record<RealmId, string>,
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
        off = hub.destroy;
      })
      .catch(() => {
        /* no WebGL: the links below still work as a plain menu */
      });
    return () => {
      dead = true;
      signal.paused = false;
      off?.();
    };
  }, []);

  return (
    <div className="hub fixed inset-0">
      <div ref={host} className="hub-canvas absolute inset-0">
        <div className="hub-intro absolute left-5 top-24 max-w-[34rem] sm:left-10">
          <h1 className="m-0 text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[0.95] tracking-[-0.03em]">
            {PROFILE.name}
            <span className="sr-only"> — {PROFILE.role}</span>
          </h1>
          <p className="mt-4 max-w-[30ch] text-lg leading-relaxed text-dim">{PROFILE.headline}</p>
        </div>

        <nav aria-label="Worlds" className="hub-links">
          {REALMS.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              ref={(a) => {
                links.current[r.id] = a;
              }}
              style={{ "--realm": r.color } as React.CSSProperties}
              className="hub-link"
            >
              <RealmIcon id={r.id} className="hub-icon" />
              <span className="hub-name">{r.name}</span>
              <span className="data-label hub-tag">{r.tagline}</span>
            </Link>
          ))}
        </nav>
      </div>

      <p className="data-label absolute bottom-5 left-5 flex flex-wrap gap-x-5 gap-y-1 text-dim sm:left-10">
        <span>Pick a world</span>
        {PROFILE.socialLinks.map((l) => (
          <a key={l.url} href={l.url} className="transition-colors hover:text-bone">
            {l.label}
          </a>
        ))}
      </p>
    </div>
  );
}
