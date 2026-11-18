// Radial mind-map layout. Pure: tree + open ids in, boxes out.
import { TREE, nodeById, type MindNode } from "@/content/tree";

export interface Box {
  id: string;
  x: number; // centre
  y: number;
  w: number;
  h: number;
  angle: number;
  /** set on a dense branch: the x of the shared vertical connector */
  trunk?: number;
}

const SIZE = [
  { w: 220, h: 84 }, // root
  { w: 204, h: 58 }, // branch
  { w: 196, h: 54 },
  { w: 208, h: 60 },
];
export const sizeOf = (depth: number) => SIZE[Math.min(depth, SIZE.length - 1)];

const RING = [0, 270, 260, 250];
const MARGIN = 18;
const MAX_FAN = 2.7; // radians
const ROOT_ANGLES = [-135, -45, 45, 135].map((d) => (d * Math.PI) / 180);

/** Above this many children, a fan stops reading as a branch. Use a rail. */
export const RAIL_MAX = 6;
export type DenseMode = "rail" | "hide";
const RAIL_GAP = 10;
const RAIL_SIZE = { w: 208, h: 48 };

/** Angular step that keeps two neighbours on a ring from touching. */
function step(r: number, at: number, w: number, h: number) {
  const s = Math.abs(Math.sin(at));
  const c = Math.abs(Math.cos(at));
  const g = Math.min((w + MARGIN) / Math.max(s, 1e-3), (h + MARGIN) / Math.max(c, 1e-3));
  return (g * 1.06) / r;
}

function place(node: MindNode, open: Set<string>, parent: Box, out: Map<string, Box>, denseOnPath: Set<string>, dense: DenseMode) {
  const kids = open.has(node.id) ? node.children : undefined;
  if (!kids?.length) return;
  // A dense branch on the focus path hides its siblings: the rail is the branch now.
  const keep = kids.filter((k) => denseOnPath.has(k.id));
  const list = keep.length ? keep : kids;
  if (!list.length) return;
  const { w, h } = sizeOf(node.depth + 1);
  if (list.length > RAIL_MAX) {
    // On a phone the panel is the list; on desktop the rail is the branch.
    if (dense === "hide") return;
    const dir = Math.cos(parent.angle) >= 0 ? 1 : -1;
    const x = parent.x + dir * (parent.w / 2 + RAIL_GAP + RAIL_SIZE.w / 2);
    const total = list.length * RAIL_SIZE.h + (list.length - 1) * RAIL_GAP;
    const top = parent.y - total / 2 + RAIL_SIZE.h / 2;
    const trunk = parent.x + dir * (parent.w / 2 + RAIL_GAP / 2);
    list.forEach((k, i) => {
      const b = {
        id: k.id,
        x,
        y: top + i * (RAIL_SIZE.h + RAIL_GAP),
        w: RAIL_SIZE.w,
        h: RAIL_SIZE.h,
        angle: parent.angle,
        trunk,
      };
      out.set(k.id, b);
      place(k, open, b, out, denseOnPath, dense);
    });
    return;
  }
  let r = Math.hypot(parent.x, parent.y) + RING[Math.min(node.depth + 1, RING.length - 1)];
  let angles: number[] = [];
  let start = 0; // first child's offset from the parent's direction
  for (let i = 0; i < 6; i++) {
    const a = [start];
    for (let k = 1; k < list.length; k++) {
      // the gap depends on direction: size it at the midpoint between the pair
      const s0 = step(r, parent.angle + a[k - 1], w, h);
      a.push(a[k - 1] + step(r, parent.angle + a[k - 1] + s0 / 2, w, h));
    }
    const span = a[a.length - 1] - a[0];
    angles = a;
    if (span > MAX_FAN) r *= span / MAX_FAN;
    start = -span / 2; // re-measure from the centred position
  }
  list.forEach((k, i) => {
    const angle = parent.angle + angles[i];
    const b = { id: k.id, x: Math.cos(angle) * r, y: Math.sin(angle) * r, w, h, angle };
    out.set(k.id, b);
    place(k, open, b, out, denseOnPath, dense);
  });
}

export function layout(open: Set<string>, focus?: string, dense: DenseMode = "rail"): Map<string, Box> {
  const denseOnPath = new Set<string>();
  for (let n = focus ? nodeById(focus) : undefined; n; n = n.parent ? nodeById(n.parent) : undefined) {
    if ((n.children?.length ?? 0) > RAIL_MAX) denseOnPath.add(n.id);
  }
  const out = new Map<string, Box>();
  const root = { id: TREE.id, x: 0, y: 0, ...sizeOf(0), angle: 0 };
  out.set(root.id, root);
  TREE.children?.forEach((k, i) => {
    const angle = ROOT_ANGLES[i % ROOT_ANGLES.length];
    const { w, h } = sizeOf(1);
    const b = { id: k.id, x: Math.cos(angle) * RING[1] * 1.15, y: Math.sin(angle) * RING[1] * 0.8, w, h, angle };
    out.set(k.id, b);
    place(k, open, b, out, denseOnPath, dense);
  });
  return out;
}

/** Everything on the path to `id` stays open, and `id` itself opens. */
export function openFor(id: string): Set<string> {
  const open = new Set<string>([TREE.id]);
  for (let n = nodeById(id); n; n = n.parent ? nodeById(n.parent) : undefined) open.add(n.id);
  return open;
}

export function overlaps(a: Box, b: Box) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}
