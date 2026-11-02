"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { PROFILE } from "@/content/profile";
import { REALMS, realm as realmOf, type RealmId } from "@/content/world";
import { RealmIcon } from "@/components/realm-icon";
import { signal } from "@/components/scene/signal";

export interface SceneDef {
  id: string;
  /** The section this scene belongs to in the world's navigation. */
  group: string;
  label: string;
  /** 3D shape the background morphs to (see components/scene/shapes.ts). */
  shape: number;
  node: React.ReactNode;
}

interface Props {
  realm: RealmId;
  /** rail: vertical index (technical) · pills: tabs (playful) · steps: ceremonial stepper */
  nav: "rail" | "pills" | "steps";
  /** where the 3D body sits: 1 right, -1 left, 0 behind the content */
  side: number;
  dim: number;
  /** raise and shrink the 3D body so it sits above centred content */
  lift?: number;
  scale?: number;
  scenes: SceneDef[];
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One world, one frame. The page never scrolls: wheel, swipe, arrow keys or the
 * navigation step through scenes, each swapping in place while the 3D body
 * morphs behind it. Without JS (or on very short screens) the scenes simply
 * stack as a normal page.
 */
export function WorldStage({ realm, nav, side, dim, lift, scale, scenes }: Props) {
  const r = realmOf(realm);
  const next = REALMS[(REALMS.findIndex((x) => x.id === realm) + 1) % REALMS.length];
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const at = useRef(0);
  const shown = useRef(0);
  const [hint, setHint] = useState(true);

  const go = useCallback(
    (to: number) => {
      const t = Math.max(0, Math.min(scenes.length - 1, to));
      if (t === at.current) return;
      at.current = t;
      setIndex(t);
      setHint(false);
    },
    [scenes.length],
  );

  const count = (scene: HTMLElement, delay: number) => {
    scene.querySelectorAll<HTMLElement>("[data-num]").forEach((n) => {
      const suffix = n.dataset.suffix ?? "";
      const to = Number(n.dataset.num);
      if (reduced()) return void (n.textContent = `${to}${suffix}`);
      const o = { v: 0 };
      n.textContent = `0${suffix}`;
      gsap.to(o, { v: to, duration: 1.5, delay, ease: "power3.out", onUpdate: () => (n.textContent = `${Math.round(o.v)}${suffix}`) });
    });
  };

  // boot: pin the frame, hand the 3D body its scene list, wire the inputs
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (innerHeight < 520) {
      el.dataset.flow = "true"; // too short to pin: plain stacked page
      return;
    }
    const els = [...el.querySelectorAll<HTMLElement>("[data-scene]")];
    el.dataset.live = "true";
    els[0].dataset.active = "true";
    signal.deck = { pos: 0, scenes: scenes.map((s) => ({ shape: s.shape, side, dim, lift, scale })) };

    if (!reduced()) {
      gsap.fromTo(
        els[0].querySelectorAll("[data-d]"),
        { autoAlpha: 0, y: 44, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.7, clearProps: "filter" },
      );
    }
    count(els[0], 1);

    // wheel: one step per gesture, so trackpad inertia can't skip scenes
    let acc = 0;
    let lastEvt = 0;
    let open = true;
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - lastEvt > 160) open = true;
      lastEvt = now;
      if (!open || now < lockUntil) return;
      acc += e.deltaY;
      if (Math.abs(acc) > 40) {
        go(at.current + (acc > 0 ? 1 : -1));
        open = false;
        lockUntil = now + 650;
        acc = 0;
      }
    };
    let y0 = 0;
    const onStart = (e: TouchEvent) => (y0 = e.touches[0].clientY);
    const onEnd = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(".stage-bar, .stage-rail, .scene-body")) return;
      const dy = y0 - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) go(at.current + (dy > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const fwd = ["ArrowDown", "ArrowRight", "PageDown"].includes(e.key);
      const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
      if (fwd || back) go(at.current + (fwd ? 1 : -1));
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(scenes.length - 1);
      else return;
      e.preventDefault();
    };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchend", onEnd, { passive: true });
    addEventListener("keydown", onKey);
    const hintTimer = setTimeout(() => setHint(false), 9000);

    return () => {
      clearTimeout(hintTimer);
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onStart);
      removeEventListener("touchend", onEnd);
      removeEventListener("keydown", onKey);
      signal.deck = null;
      gsap.killTweensOf(els.flatMap((s) => [...s.querySelectorAll("[data-d]")]));
      delete el.dataset.live;
    };
  }, [scenes, side, dim, lift, scale, go]);

  // swap scenes in place whenever the index changes
  useEffect(() => {
    const el = root.current;
    const from = shown.current;
    if (!el || !el.dataset.live || from === index) return;
    const els = [...el.querySelectorAll<HTMLElement>("[data-scene]")];
    const dir = index > from ? 1 : -1;
    const parts = (s: HTMLElement) => [...s.querySelectorAll<HTMLElement>("[data-d]")];
    els.forEach((s) => gsap.killTweensOf(parts(s)));
    els.forEach((s, i) => {
      if (i !== index && s.dataset.active) {
        if (reduced()) delete s.dataset.active;
        else
          gsap.to(parts(s), {
            autoAlpha: 0,
            y: -dir * 34,
            filter: "blur(8px)",
            duration: 0.32,
            ease: "power2.in",
            stagger: 0.02,
            onComplete: () => {
              delete s.dataset.active;
              gsap.set(parts(s), { clearProps: "all" });
            },
          });
      }
    });
    const into = els[index];
    into.dataset.active = "true";
    if (!reduced()) {
      gsap.fromTo(
        parts(into),
        { autoAlpha: 0, y: dir * 44, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.95, ease: "expo.out", stagger: 0.07, delay: 0.28, clearProps: "filter" },
      );
    }
    count(into, 0.5);
    if (signal.deck) {
      gsap.killTweensOf(signal.deck);
      gsap.to(signal.deck, { pos: index, duration: reduced() ? 0 : Math.min(2.2, 0.8 + 0.3 * Math.abs(index - from)), ease: "power3.inOut" });
    }
    shown.current = index;
  }, [index]);

  const groups = scenes.reduce<{ name: string; items: { i: number; s: SceneDef }[] }[]>((acc, s, i) => {
    const g = acc.find((x) => x.name === s.group) ?? acc[acc.push({ name: s.group, items: [] }) - 1];
    g.items.push({ i, s });
    return acc;
  }, []);

  const foot = (
    <>
      <Link href={next.href} className="stage-link" style={{ "--link": next.color } as React.CSSProperties}>
        <RealmIcon id={next.id} className="shrink-0" />
        <span>
          <span className="data-label block text-dim">Next world</span>
          {next.name} <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
      <div className="data-label flex flex-wrap gap-x-4 gap-y-1 text-dim">
        <Link href="/" className="transition-colors hover:text-bone">
          All worlds
        </Link>
        <a href={`mailto:${PROFILE.contactEmail}`} className="transition-colors hover:text-bone">
          Say hello
        </a>
      </div>
    </>
  );

  return (
    <div ref={root} className="stage" data-nav={nav} data-realm={realm} style={{ "--realm": r.color } as React.CSSProperties}>
      <h1 className="sr-only">
        {r.name} — {PROFILE.name}
      </h1>
      <p className="sr-only" aria-live="polite">
        {scenes[index].label}
      </p>

      {scenes.map((s) => (
        <section key={s.id} data-scene aria-label={s.label} className="scene">
          <div className="scene-body">{s.node}</div>
        </section>
      ))}

      {nav === "rail" && (
        <aside className="stage-rail" aria-label={`${r.name} sections`}>
          <div className="flex items-center gap-3 text-[color:var(--realm)]">
            <RealmIcon id={realm} />
            <span className="font-display text-2xl leading-none text-bone">{r.name}</span>
          </div>
          {groups.map((g) => (
            <div key={g.name} className="rail-group">
              <p className="data-label">{g.name}</p>
              {g.items.map(({ i, s }) => (
                <button key={s.id} type="button" onClick={() => go(i)} aria-current={index === i ? "true" : undefined} className="rail-item">
                  {s.label}
                </button>
              ))}
            </div>
          ))}
          <div className="rail-foot">{foot}</div>
        </aside>
      )}

      <div className="stage-bar" data-variant={nav}>
        {nav === "steps" ? (
          <div className="stage-steps">
            {scenes.map((s, i) => (
              <button key={s.id} type="button" aria-label={s.label} onClick={() => go(i)} aria-current={index === i ? "true" : undefined} className="stage-step" />
            ))}
            <span className="data-label ml-3 text-dim" aria-hidden="true">
              {scenes[index].label}
            </span>
          </div>
        ) : (
          <div className="stage-chips">
            {scenes.map((s, i) => (
              <button key={s.id} type="button" onClick={() => go(i)} aria-current={index === i ? "true" : undefined} className="stage-chip">
                {s.label}
              </button>
            ))}
          </div>
        )}
        <Link href={next.href} className="stage-next data-label" style={{ "--link": next.color } as React.CSSProperties}>
          {next.name} <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {hint && (
        <p className="stage-hint data-label" aria-hidden="true">
          Scroll, swipe or press &darr;
        </p>
      )}
    </div>
  );
}
