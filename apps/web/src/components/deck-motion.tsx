"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signal } from "@/components/scene/signal";

gsap.registerPlugin(ScrollTrigger);

const smooth = (x: number) => (x = Math.min(1, Math.max(0, x))) * x * (3 - 2 * x);

/**
 * Pins the home page into one screen. Scrolling no longer moves content: it
 * scrubs a position over the scenes in [data-deck]. The 3D body morphs
 * continuously (via signal.deck) and each scene's text swaps in place.
 *
 * Without JS, with reduced motion, or on very short screens the scenes simply
 * stack as normal sections (the CSS only pins when [data-live] is set).
 */
export function DeckMotion() {
  useEffect(() => {
    const deck = document.querySelector<HTMLElement>("[data-deck]");
    if (!deck) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerHeight < 520) {
      deck.dataset.flow = "true"; // plain stacked sections
      return;
    }

    const scenes = [...deck.querySelectorAll<HTMLElement>("[data-scene]")];
    const dots = [...deck.querySelectorAll<HTMLButtonElement>("[data-goto]")];
    const label = deck.querySelector<HTMLElement>("[data-rail-label]");
    const n = scenes.length;
    deck.style.setProperty("--n", String(n));
    deck.dataset.live = "true";

    const meta = scenes.map((el) => ({
      shape: Number(el.dataset.stage ?? 0),
      side: Number(el.dataset.side ?? 1),
      dim: Number(el.dataset.dim ?? 0),
    }));
    signal.deck = { pos: 0, scenes: meta };

    let current = 0;
    scenes[0].dataset.active = "true";
    dots[0]?.setAttribute("aria-current", "true");
    if (label) label.textContent = scenes[0].dataset.label ?? "";

    const show = (next: number) => {
      const into = scenes[next];
      scenes.forEach((s) => gsap.killTweensOf([s, ...s.querySelectorAll("[data-d]")]));
      scenes.forEach((s) => {
        if (s !== into && s.dataset.active) {
          gsap.to(s, {
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => delete s.dataset.active,
          });
        }
      });
      into.dataset.active = "true";
      const parts = into.querySelectorAll("[data-d]");
      gsap.set(into, { autoAlpha: 1 });
      gsap.fromTo(
        parts,
        { autoAlpha: 0, y: 44, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out", stagger: 0.09, delay: 0.22, clearProps: "filter" },
      );
      dots.forEach((d, i) => (i === next ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
      if (label) label.textContent = into.dataset.label ?? "";
      current = next;
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: deck,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const raw = self.progress * (n - 1);
          const i = Math.min(Math.floor(raw), n - 2);
          // dwell on each scene for the first part of its stretch, then morph to the next
          const pos = n < 2 ? 0 : i + smooth((raw - i - 0.4) / 0.6);
          if (signal.deck) signal.deck.pos = pos;
          const idx = Math.round(pos);
          if (idx !== current) show(idx);
        },
      });
    }, deck);

    const onGo = (e: Event) => {
      const i = dots.indexOf(e.currentTarget as HTMLButtonElement);
      const total = deck.offsetHeight - innerHeight;
      scrollTo({ top: deck.offsetTop + (i / (n - 1)) * total, behavior: "smooth" });
    };
    dots.forEach((d) => d.addEventListener("click", onGo));
    ScrollTrigger.refresh();

    return () => {
      dots.forEach((d) => d.removeEventListener("click", onGo));
      ctx.revert();
      signal.deck = null;
      delete deck.dataset.live;
      scenes.forEach((s) => {
        delete s.dataset.active;
        gsap.set([s, ...s.querySelectorAll("[data-d]")], { clearProps: "all" });
      });
    };
  }, []);

  return null;
}
