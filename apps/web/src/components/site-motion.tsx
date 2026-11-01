"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { signal } from "@/components/scene/signal";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const EXPO = "expo.out";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One motion controller for the public site, driven by data attributes so
 * pages stay server components:
 *   data-chars     hero name: letters swing up in 3D
 *   data-split     heading lines rise out of a mask
 *   data-reveal    fade/lift/unblur on enter
 *   data-words     paragraph words light up with scroll
 *   data-scramble  mono labels decode on enter
 *   data-marquee   track loops, speeds up with scroll velocity
 *   data-magnetic  element leans toward the pointer
 *   data-excite    hovering excites the 3D body
 *   data-fade-out  hero content dissolves as you leave it
 *   data-progress  hairline scaleX tied to page scroll
 * Also owns the route curtain and the custom cursor.
 * Hidden-until-animated is gated in site.css on motion being allowed.
 */
export function SiteMotion() {
  const pathname = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // route curtain + cursor: live for the whole session
  useEffect(() => {
    if (reducedMotion()) return;
    const c = curtain.current;
    const cur = cursor.current;
    if (!c || !cur) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || u.pathname.startsWith("/workspace")) return;
      e.preventDefault();
      gsap.set(c, { transformOrigin: "50% 100%" });
      gsap.to(c, { scaleY: 1, duration: 0.65, ease: "expo.inOut", onComplete: () => router.push(u.pathname + u.search + u.hash) });
    };
    document.addEventListener("click", onClick, true);

    const fine = matchMedia("(pointer: fine)").matches;
    let off = () => {};
    if (fine) {
      const x = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3.out" });
      const y = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        cur.dataset.on = "true";
      };
      const over = (e: PointerEvent) => {
        cur.dataset.hot = String(!!(e.target as Element).closest("a,button,[data-excite]"));
      };
      addEventListener("pointermove", move, { passive: true });
      addEventListener("pointerover", over, { passive: true });
      off = () => {
        removeEventListener("pointermove", move);
        removeEventListener("pointerover", over);
      };
    }
    return () => {
      document.removeEventListener("click", onClick, true);
      off();
    };
  }, [router]);

  // per-page choreography
  useEffect(() => {
    const c = curtain.current;
    if (reducedMotion()) return;
    // base delay: the intro assembles the body on first load, the curtain lifts on later routes
    const base = first.current ? 0.5 : 0.55;
    if (!first.current && c) {
      scrollTo(0, 0);
      gsap.set(c, { transformOrigin: "50% 0%" });
      gsap.to(c, { scaleY: 0, duration: 0.9, delay: 0.1, ease: "expo.inOut" });
    }
    first.current = false;

    let ctx: gsap.Context | undefined;
    let dead = false;

    document.fonts.ready.then(() => {
      if (dead) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-chars]").forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          SplitText.create(el, {
            type: "chars",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 120,
                rotateX: -85,
                opacity: 0,
                filter: "blur(10px)",
                transformOrigin: "50% 100% -30px",
                duration: 1.6,
                ease: EXPO,
                stagger: 0.045,
                delay: base + Number(el.dataset.delay ?? 0),
              }),
          });
          el.style.perspective = "800px";
        });

        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          const delay = base * 0.5 + Number(el.dataset.delay ?? 0);
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                rotate: 2.5,
                duration: 1.3,
                ease: EXPO,
                stagger: 0.11,
                delay,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { autoAlpha: 0, y: 36, filter: "blur(8px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: EXPO, stagger: 0.08, delay: base * 0.4, clearProps: "filter" },
            ),
        });

        gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el) => {
          const text = el.textContent ?? "";
          gsap.to(el, {
            duration: 1.2,
            scrambleText: { text, chars: "01·/<>_", speed: 0.5, revealDelay: 0.1 },
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          SplitText.create(el, {
            type: "words",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.12,
                  scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 52%", scrub: 0.6 },
                },
              ),
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((track) => {
          const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 36, repeat: -1 });
          ScrollTrigger.create({
            onUpdate: (self) => {
              gsap.to(loop, { timeScale: 1 + Math.abs(self.getVelocity()) / 250, duration: 0.2, overwrite: true });
              gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2 });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
          const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
          el.addEventListener("pointermove", (e) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.28);
            y((e.clientY - (r.top + r.height / 2)) * 0.28);
          });
          el.addEventListener("pointerleave", () => (x(0), y(0)));
        });

        gsap.utils.toArray<HTMLElement>("[data-excite]").forEach((el) => {
          const to = (v: number) => () => gsap.to(signal, { excite: v, duration: 0.8, ease: "power3.out", overwrite: true });
          el.addEventListener("pointerenter", to(1));
          el.addEventListener("pointerleave", to(0));
        });

        gsap.utils.toArray<HTMLElement>("[data-fade-out]").forEach((el) =>
          gsap.to(el, {
            opacity: 0,
            y: -70,
            filter: "blur(10px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top top", end: "bottom 25%", scrub: true },
          }),
        );

        gsap.utils.toArray<HTMLElement>("[data-progress]").forEach((el) =>
          gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } }),
        );
      });
      ScrollTrigger.refresh();
    });

    return () => {
      dead = true;
      ctx?.revert();
      gsap.set(signal, { excite: 0 });
    };
  }, [pathname]);

  return (
    <>
      <div ref={curtain} aria-hidden="true" className="curtain" />
      <div ref={cursor} aria-hidden="true" className="cursor">
        <span />
      </div>
    </>
  );
}
