"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PROFILE } from "@/content/profile";
import { ENTRIES, REALMS, byRealm, entryById, type RealmId } from "@/content/world";
import { signal } from "@/components/scene/signal";
import type { World } from "./world-engine";

const STORE = "ak-world-v1";
type Panel = { kind: "entry"; id: string } | { kind: "finale" } | null;

const readStore = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && entryById(x)) : [];
  } catch {
    return [];
  }
};

export function GameShell() {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<World | null>(null);
  const collectedRef = useRef<string[]>([]);
  const finalePending = useRef(false);

  const [phase, setPhase] = useState<"menu" | "play">("menu");
  const [collected, setCollected] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [near, setNear] = useState<RealmId | null>(null);
  const [codex, setCodex] = useState(false);
  const [hint, setHint] = useState(false);
  const [fallback, setFallback] = useState(false);

  const total = ENTRIES.length;
  const counts = useMemo(
    () => Object.fromEntries(REALMS.map((r) => [r.id, byRealm(r.id).filter((e) => collected.includes(e.id)).length])) as Record<RealmId, number>,
    [collected],
  );

  const add = useCallback((id: string) => {
    if (collectedRef.current.includes(id)) return false;
    collectedRef.current = [...collectedRef.current, id];
    setCollected(collectedRef.current);
    try {
      localStorage.setItem(STORE, JSON.stringify(collectedRef.current));
    } catch {}
    if (collectedRef.current.length === ENTRIES.length) finalePending.current = true;
    return true;
  }, []);

  // the 3D world: loaded on the client only, three.js stays out of the first paint
  useEffect(() => {
    const saved = readStore();
    collectedRef.current = saved;
    const el = host.current;
    if (!el) return;
    let dead = false;
    signal.paused = true;
    import("./world-engine")
      .then(({ createWorld }) => {
        if (dead) return;
        setCollected(saved);
        world.current = createWorld(el, {
          items: ENTRIES.map((e) => ({ id: e.id, realm: e.realm })),
          collected: saved,
          labels: Object.fromEntries(REALMS.map((r) => [r.id, r.name])) as Record<RealmId, string>,
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
          onCollect: (id) => {
            add(id);
            setPanel({ kind: "entry", id });
          },
          onRealm: setNear,
        });
      })
      .catch(() => {
        if (!dead) {
          setFallback(true);
          setCodex(true);
        }
      });
    return () => {
      dead = true;
      signal.paused = false;
      world.current?.destroy();
      world.current = null;
    };
  }, [add]);

  const begin = (realm: RealmId) => {
    world.current?.start(realm);
    setPhase("play");
    setPanel(null);
    setHint(true);
    setTimeout(() => setHint(false), 8000);
  };
  const travel = (realm: RealmId) => {
    world.current?.goTo(realm);
    setPhase("play");
    setCodex(false);
    setPanel(null);
  };
  const toMenu = () => {
    world.current?.menu();
    setPhase("menu");
    setPanel(null);
    setCodex(false);
  };
  const open = (id: string) => {
    if (add(id)) world.current?.markCollected(id);
    setPanel({ kind: "entry", id });
  };
  const closePanel = useCallback(() => {
    setPanel((p) => {
      if (p?.kind === "entry" && finalePending.current) {
        finalePending.current = false;
        return { kind: "finale" };
      }
      return null;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (codex && !fallback) setCodex(false);
      else if (panel) closePanel();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [codex, panel, fallback, closePanel]);

  const entry = panel?.kind === "entry" ? entryById(panel.id) : null;
  const realm = near ? REALMS.find((r) => r.id === near) : null;
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

  return (
    <div className="game fixed inset-0 overflow-hidden">
      <div ref={host} className="absolute inset-0" />

      {/* title screen */}
      {phase === "menu" && !fallback && (
        <div className="game-menu absolute inset-0 flex flex-col justify-end gap-8 px-5 pb-10 pt-28 sm:justify-center sm:px-10">
          <div className="max-w-[40rem]">
            <h1 className="m-0 text-[clamp(3rem,9vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              {PROFILE.name}
              <span className="sr-only"> — {PROFILE.role}</span>
            </h1>
            <p className="mt-4 max-w-[34ch] text-lg leading-relaxed text-dim">
              {PROFILE.headline} Pick a realm to start exploring.
            </p>
          </div>
          <ul className="m-0 flex max-w-[40rem] list-none flex-col p-0">
            {REALMS.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => begin(r.id)} data-excite className="row-link game-choice w-full cursor-pointer text-left">
                  <span className="flex items-baseline justify-between gap-6 px-1 py-4 sm:py-5">
                    <span className="row-title font-display text-3xl leading-none sm:text-5xl">{r.name}</span>
                    <span className="data-label text-dim">
                      {counts[r.id]}/{byRealm(r.id).length}
                    </span>
                  </span>
                  <span className="data-label block px-1 pb-4 text-dim">{r.tagline}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="data-label flex flex-wrap items-center gap-x-6 gap-y-2 text-dim">
            <a href={`mailto:${PROFILE.contactEmail}`} className="transition-colors hover:text-bone">
              Say hello
            </a>
            <Link href="/resume" className="transition-colors hover:text-bone">
              Skip the game
            </Link>
            <button type="button" onClick={() => setCodex(true)} className="cursor-pointer transition-colors hover:text-bone">
              Read everything
            </button>
          </div>
        </div>
      )}

      {/* HUD */}
      {phase === "play" && (
        <>
          <div className="pointer-events-none absolute left-5 top-20 sm:left-10">
            <div className="data-label text-dim">
              Unlocked {collected.length}/{total}
            </div>
            <div className="mt-2 h-px w-32 bg-hairline">
              <div className="h-px bg-bone transition-[width] duration-700" style={{ width: `${(collected.length / total) * 100}%` }} />
            </div>
          </div>

          {hint && (
            <p className="data-label pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 text-center text-dim">
              {touch ? "Tap the ground to move" : "WASD or arrows to move, or click the ground"}
            </p>
          )}

          {realm && !panel && (
            <div className="game-toast pointer-events-none absolute bottom-24 left-5 right-5 sm:left-10 sm:right-auto sm:max-w-[26rem]">
              <h2 className="text-3xl leading-none tracking-tight">{realm.name}</h2>
              <p className="mt-2 leading-relaxed text-dim">{realm.intro}</p>
              <p className="data-label mt-3 text-dim">
                {counts[realm.id]}/{byRealm(realm.id).length} collected. Walk into the glowing shapes.
              </p>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 px-5 pb-5 sm:px-10">
            <div className="flex flex-wrap gap-2">
              {REALMS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => travel(r.id)}
                  aria-current={near === r.id ? "true" : undefined}
                  className="game-pill"
                >
                  {r.name} <span className="text-dim">{counts[r.id]}/{byRealm(r.id).length}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCodex(true)} className="game-pill">
                Codex
              </button>
              <button type="button" onClick={toMenu} className="game-pill">
                Menu
              </button>
            </div>
          </div>
        </>
      )}

      {/* entry card / finale */}
      {panel && (
        <aside
          role="dialog"
          aria-label={entry?.title ?? "All unlocked"}
          className="game-card absolute z-10 inset-x-3 bottom-20 max-h-[62svh] overflow-auto sm:inset-x-auto sm:bottom-auto sm:right-10 sm:top-1/2 sm:max-h-[70svh] sm:w-[27rem] sm:-translate-y-1/2"
        >
          <button type="button" onClick={closePanel} aria-label="Close" className="game-close">
            &times;
          </button>
          {entry ? (
            <>
              {entry.meta && <p className="data-label mb-3 pr-10 text-dim">{entry.meta}</p>}
              <h2 className="pr-8 text-3xl leading-[1.05] tracking-tight sm:text-4xl">{entry.title}</h2>
              {entry.placeholder && <p className="data-label mt-3 inline-block border border-hairline px-2 py-1 text-dim">Placeholder</p>}
              <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0 leading-relaxed text-dim">
                {entry.body.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className="pr-8 text-3xl leading-[1.05] tracking-tight sm:text-4xl">Everything unlocked.</h2>
              <p className="mt-4 leading-relaxed text-dim">You found it all. If something here sounded interesting, let&rsquo;s talk.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`mailto:${PROFILE.contactEmail}`} className="btn-solid">
                  Say hello <span aria-hidden="true">&rarr;</span>
                </a>
                <a href={PROFILE.socialLinks[1].url} className="btn-ghost">
                  LinkedIn
                </a>
              </div>
            </>
          )}
        </aside>
      )}

      {/* codex: the whole world as a list (also the no-WebGL fallback) */}
      {codex && (
        <div role="dialog" aria-label="Codex" className="game-codex absolute inset-0 overflow-auto px-5 pb-16 pt-24 sm:px-10">
          <div className="mx-auto max-w-[56rem]">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 className="text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight">Codex</h2>
              {!fallback && (
                <button type="button" onClick={() => setCodex(false)} className="game-pill">
                  Close
                </button>
              )}
            </div>
            {fallback && <p className="mb-8 text-dim">3D isn&rsquo;t available here, so here is everything as a list.</p>}
            {REALMS.map((r) => (
              <section key={r.id} className="mb-10">
                <h3 className="text-2xl tracking-tight">{r.name}</h3>
                <p className="data-label mb-3 mt-1 text-dim">{r.intro}</p>
                <ul className="m-0 list-none p-0">
                  {byRealm(r.id).map((e) => (
                    <li key={e.id} className="row-link">
                      <button
                        type="button"
                        onClick={() => {
                          open(e.id);
                          if (!fallback) setCodex(false);
                        }}
                        className="flex w-full cursor-pointer items-baseline justify-between gap-4 px-1 py-3 text-left"
                      >
                        <span className="text-lg">{e.title}</span>
                        <span className="data-label text-dim">{collected.includes(e.id) ? "Unlocked" : "Reveal"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="data-label flex gap-6 text-dim">
              <Link href="/resume" className="hover:text-bone">
                Plain version
              </Link>
              <a href={`mailto:${PROFILE.contactEmail}`} className="hover:text-bone">
                Say hello
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
