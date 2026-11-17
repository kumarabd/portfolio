"use client";

import { useEffect } from "react";

/** Marks diagrams, charts and timelines as seen when they scroll into view, so their CSS entrance plays once. */
export function BlogMotion() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".prose .diagram, .prose .chart, .prose .stats, .prose .timeline, .prose .reveal, .prose .heat");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.25 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}
