"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

export function Caret({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("caret-blink inline-block w-[0.55em] bg-current align-[-0.1em]", className)} style={{ height: "1em" }} />;
}

export interface TypedLine {
  /** e.g. "$" or "jvale@site:~$" — rendered dim, before the typed text. */
  prompt?: string;
  text: string;
  /** Extra classes for the typed text segment (e.g. brighter color for output lines). */
  className?: string;
}

/**
 * Types a sequence of terminal lines one at a time, each prefixed by an
 * optional prompt. Falls back to rendering everything instantly when the
 * user prefers reduced motion.
 */
export function TypedLines({
  lines,
  className,
  speed = 28,
  lineDelay = 350,
  startDelay = 150,
  onDone,
}: {
  lines: TypedLine[];
  className?: string;
  speed?: number;
  lineDelay?: number;
  startDelay?: number;
  onDone?: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (reducedMotion) {
      // Render already treats every line as "past" when reducedMotion is
      // true (see isPast below), so there's no line/char state to set here.
      onDoneRef.current?.();
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function typeLine(idx: number) {
      if (idx >= lines.length) {
        onDoneRef.current?.();
        return;
      }
      const text = lines[idx].text;
      let pos = 0;
      const tick = () => {
        if (cancelled) return;
        pos += 1;
        setLineIndex(idx);
        setCharIndex(pos);
        if (pos < text.length) {
          timeouts.push(setTimeout(tick, speed));
        } else {
          timeouts.push(
            setTimeout(() => {
              setLineIndex(idx + 1);
              setCharIndex(0);
              typeLine(idx + 1);
            }, lineDelay),
          );
        }
      };
      timeouts.push(setTimeout(tick, speed));
    }

    timeouts.push(setTimeout(() => typeLine(0), startDelay));

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lines is a stable literal passed by callers
  }, [reducedMotion, speed, lineDelay, startDelay]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {lines.map((line, idx) => {
        const isPast = idx < lineIndex || reducedMotion;
        const isCurrent = idx === lineIndex && !reducedMotion;
        if (!isPast && !isCurrent) return null;

        const shown = isCurrent ? line.text.slice(0, charIndex) : line.text;

        return (
          <div key={idx} className="flex flex-wrap items-baseline gap-2">
            {line.prompt && <span className="text-[var(--color-secondary)]">{line.prompt}</span>}
            <span className={line.className}>
              {shown}
              {isCurrent && <Caret className="text-[var(--color-primary)]" />}
            </span>
          </div>
        );
      })}
    </div>
  );
}
