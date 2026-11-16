"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Briefcase, ChevronRight, Maximize2, Minus, Mountain, Plus, Send, Trophy, X } from "lucide-react";
import { PROFILE } from "@/content/profile";
import { TREE, nodeById, pathTo, type MindNode } from "@/content/tree";
import { NodeGlyph, TagGlyph } from "./glyph";
import { layout, openFor, type Box } from "./layout";

const ICON: Record<string, typeof Briefcase> = { professional: Briefcase, hobby: Mountain, fame: Trophy, contact: Send };
const SPRING = { type: "spring", stiffness: 170, damping: 22, mass: 0.9 } as const;

const edge = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
  const m = horizontal ? { x: (a.x + b.x) / 2, y: 0 } : { x: 0, y: (a.y + b.y) / 2 };
  return horizontal
    ? `M ${a.x} ${a.y} C ${m.x} ${a.y}, ${m.x} ${b.y}, ${b.x} ${b.y}`
    : `M ${a.x} ${a.y} C ${a.x} ${m.y}, ${b.x} ${m.y}, ${b.x} ${b.y}`;
};

export function MindMap({ initial = "me" }: { initial?: string }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const viewport = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(nodeById(initial) ? initial : "me");
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);
  const [zoomMul, setZoomMul] = useState(1);
  const placed = useRef(false);
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camZ = useMotionValue(0.8);

  const open = useMemo(() => openFor(focus), [focus]);
  const boxes = useMemo(() => layout(open), [open]);
  const trail = useMemo(() => pathTo(focus), [focus]);
  const node = nodeById(focus)!;
  const wide = size.w >= 900;

  useLayoutEffect(() => {
    const el = viewport.current!;
    const measure = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      setReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the camera frames the focused node, its parent and its children
  const frame = useMemo(() => {
    const ids = [focus, wide ? node.parent : undefined, ...(node.children?.map((c) => c.id) ?? [])].filter(Boolean) as string[];
    if (focus === "me") ids.push(...(TREE.children?.map((c) => c.id) ?? []));
    const bs = ids.map((i) => boxes.get(i)).filter(Boolean) as Box[];
    const x0 = Math.min(...bs.map((b) => b.x - b.w / 2));
    const x1 = Math.max(...bs.map((b) => b.x + b.w / 2));
    const y0 = Math.min(...bs.map((b) => b.y - b.h / 2));
    const y1 = Math.max(...bs.map((b) => b.y + b.h / 2));
    const availW = size.w - (wide ? 420 : 0) - 48;
    const availH = size.h - (wide ? 0 : Math.min(size.h * 0.42, 320)) - 120;
    const z = Math.max(wide ? 0.42 : 0.6, Math.min(1.05, availW / (x1 - x0), availH / (y1 - y0))) * zoomMul;
    return { z, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, availW: availW + 48, availH: availH + 120 };
  }, [boxes, focus, node, size, wide, zoomMul]);

  useEffect(() => {
    const target = { x: frame.availW / 2 - frame.cx * frame.z + 24 * 0, y: frame.availH / 2 - frame.cy * frame.z + 56, z: frame.z };
    if (!placed.current) {
      // first measured frame: jump, don't fly in from the default size
      camX.set(target.x); camY.set(target.y); camZ.set(target.z);
      placed.current = ready;
      return;
    }
    const t = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 90, damping: 20, mass: 1 };
    const a = [animate(camX, target.x, t), animate(camY, target.y, t), animate(camZ, target.z, t)];
    return () => a.forEach((c) => c.stop());
  }, [frame, ready, reduce, camX, camY, camZ]);

  // deep links: #<node id>
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && nodeById(id)) setFocus(id);
    };
    fromHash();
    addEventListener("hashchange", fromHash);
    return () => removeEventListener("hashchange", fromHash);
  }, []);

  const go = useCallback((id: string) => {
    setFocus(id);
    setTouched(true);
    setZoomMul(1);
    history.replaceState(null, "", id === "me" ? location.pathname : `#${encodeURIComponent(id)}`);
  }, []);

  const select = (n: MindNode) => {
    if (n.href) return n.href.startsWith("/") ? router.push(n.href) : window.open(n.href, "_blank", "noopener");
    // a focused node folds back; anything else opens
    go(n.id === focus && n.parent ? n.parent : n.id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && node.parent) go(node.parent);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [node, go]);

  // drag to pan, wheel to zoom
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button,a,aside")) return;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    camX.set(camX.get() + e.clientX - drag.current.x);
    camY.set(camY.get() + e.clientY - drag.current.y);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const zoom = (f: number) => setZoomMul((m) => Math.max(0.5, Math.min(2, m * f)));

  const visible = [...boxes.keys()].map((id) => nodeById(id)!);
  const near = new Set([...trail, ...(node.children?.map((c) => c.id) ?? [])]);

  return (
    <div
      ref={viewport}
      className="map-viewport"
      data-ready={ready}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => (drag.current = null)}
      onWheel={(e) => e.ctrlKey && zoom(e.deltaY < 0 ? 1.08 : 0.92)}
    >
      <header className="map-head">
        <button className="map-id" onClick={() => go("me")} aria-label="Back to the centre of the map">
          <h1>{PROFILE.name} — {PROFILE.role}</h1>
        </button>
        <nav aria-label="Elsewhere">
          <Link href="/blog">Writing</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/workspace">Workspace</Link>
        </nav>
      </header>

      <motion.div className="map-stage" style={{ x: camX, y: camY, scale: camZ }}>
        <svg className="map-edges" width="1" height="1" aria-hidden="true">
          <AnimatePresence>
            {visible.filter((n) => n.parent).map((n) => {
              const p = boxes.get(n.parent!)!;
              const c = boxes.get(n.id)!;
              const active = trail.includes(n.id);
              return (
                <g key={n.id}>
                  <motion.path
                    stroke={n.color}
                    strokeWidth={n.depth === 1 ? 3 : 2}
                    strokeLinecap="round"
                    fill="none"
                    initial={{ d: edge(p, p), opacity: 0 }}
                    animate={{ d: edge(p, c), opacity: active ? 0.9 : near.has(n.id) ? 0.55 : 0.25 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={reduce ? { duration: 0 } : SPRING}
                  />
                  {active && !reduce && <path className="edge-glint" d={edge(p, c)} stroke={n.color} fill="none" strokeWidth={4} strokeLinecap="round" pathLength={100} />}
                </g>
              );
            })}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {visible.map((n, i) => {
            const b = boxes.get(n.id)!;
            const from = n.parent ? boxes.get(n.parent)! : b;
            const Icon = ICON[n.id];
            const kids = n.children?.length ?? 0;
            const isFocus = n.id === focus;
            const lit = near.has(n.id) || n.depth === 1 || n.id === "me";
            return (
              <motion.div
                key={n.id}
                className="node-pos"
                style={{ width: b.w, height: b.h, left: -b.w / 2, top: -b.h / 2 }}
                initial={{ x: from.x, y: from.y, scale: 0.2, opacity: 0 }}
                animate={{ x: b.x, y: b.y, scale: 1, opacity: lit ? 1 : 0.7 }}
                exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.18 } }}
                transition={reduce ? { duration: 0 } : { ...SPRING, delay: ready ? (n.parent ? (i % 8) * 0.035 : 0) : 0.15 + i * 0.08 }}
              >
                <button
                  className="node"
                  data-depth={Math.min(n.depth, 2)}
                  data-leaf={kids === 0}
                  data-focus={isFocus}
                  data-placeholder={n.placeholder || undefined}
                  style={{ "--c": n.color, "--bob": `${(i * 0.7) % 5}s` } as React.CSSProperties}
                  aria-expanded={kids ? open.has(n.id) : undefined}
                  aria-current={isFocus || undefined}
                  onClick={() => select(n)}
                >
                  {Icon ? <Icon size={18} strokeWidth={2.2} aria-hidden="true" /> : <NodeGlyph id={n.id} size={n.depth > 2 ? 16 : 18} colored />}
                  <span className="node-label">{n.label}</span>
                  {n.href && !n.href.startsWith("/") ? <ArrowUpRight size={16} aria-hidden="true" /> : kids > 0 && !open.has(n.id) ? <span className="node-count" aria-label={`${kids} inside`}>{kids}</span> : null}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="map-tools" role="group" aria-label="Map view">
        <button onClick={() => zoom(1.2)} aria-label="Zoom in"><Plus size={18} /></button>
        <button onClick={() => zoom(0.83)} aria-label="Zoom out"><Minus size={18} /></button>
        <button onClick={() => go(focus)} aria-label="Re-centre"><Maximize2 size={16} /></button>
      </div>

      {!touched && (
        <motion.p className="map-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          Open a bubble to see what is inside it.
        </motion.p>
      )}

      <aside className="map-panel" aria-label="Details" style={{ "--c": node.color } as React.CSSProperties}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={node.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <ol className="crumbs" aria-label="Path">
              {trail.map((id, i) => (
                <li key={id}>
                  {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
                  <button onClick={() => go(id)} aria-current={id === focus || undefined}>{id === "me" ? "Me" : nodeById(id)!.label}</button>
                </li>
              ))}
            </ol>
            <h2><span className="title-glyph"><NodeGlyph id={node.id} size={22} colored /></span>{node.label}</h2>
            {node.sub && <p className="sub">{node.sub}</p>}
            {node.placeholder && <p className="placeholder-note">To be filled in.</p>}
            {node.body?.map((p) => <p key={p} className="body">{p}</p>)}
            {node.tags && (
              <ul className="tags">
                {node.tags.map((t) => <li key={t}><TagGlyph tag={t} />{t}</li>)}
              </ul>
            )}
            {(node.link || node.href?.startsWith("/")) && (
              <Link className="open-link" href={(node.link ?? { href: node.href! }).href}>
                {node.link?.label ?? "Read the post"} <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            )}
            {node.id === "me" && (
              <ul className="links">
                {PROFILE.socialLinks.map((l) => (
                  <li key={l.label}><a href={l.url}>{l.label}<ArrowUpRight size={14} aria-hidden="true" /></a></li>
                ))}
              </ul>
            )}
            {node.parent && (
              <button className="back" onClick={() => go(node.parent!)}>
                <X size={14} aria-hidden="true" /> Close
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}
