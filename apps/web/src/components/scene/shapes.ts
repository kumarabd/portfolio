// Point-cloud targets the particle body morphs between. Every shape stands for
// something on the page; the id is what [data-stage] points at.
export const SHAPE = { net: 0, rack: 1, blocks: 2, shield: 3, pulse: 4, wheel: 5, globe: 6 } as const;
export const SHAPE_COUNT = 7;

const r = Math.random;
const g = () => (r() + r() + r() - 1.5) * 0.67; // soft gaussian-ish, ~[-1,1]
const TAU = Math.PI * 2;

type Fill = (a: Float32Array, o: number) => void;
const build = (n: number, fill: Fill) => {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) fill(a, i * 3);
  return a;
};
const put = (a: Float32Array, o: number, x: number, y: number, z: number, j = 0) => {
  a[o] = x + g() * j;
  a[o + 1] = y + g() * j;
  a[o + 2] = z + g() * j;
};
type V = [number, number, number];
const lerp3 = (p: V, q: V, t: number): V => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
const pickOf = <T,>(arr: T[]) => arr[(r() * arr.length) | 0];

/** Edges of an axis-aligned box centred at c with half-size h. */
function boxEdges(c: V, h: V): [V, V][] {
  const k = (sx: number, sy: number, sz: number): V => [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]];
  const e: [V, V][] = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      e.push([k(-1, a, b), k(1, a, b)], [k(a, -1, b), k(a, 1, b)], [k(a, b, -1), k(a, b, 1)]);
    }
  return e;
}

/** 0 — AI infrastructure: a layered neural network. */
function net(n: number) {
  const layers = [4, 6, 6, 3];
  const xs = [-3.5, -1.2, 1.2, 3.5];
  const nodes: V[][] = layers.map((count, li) =>
    Array.from({ length: count }, (_, k) => [xs[li], (k - (count - 1) / 2) * 1.05, Math.sin(k * 2.1 + li) * 0.5] as V),
  );
  const edges: [V, V][] = [];
  // each neuron feeds its 3 nearest neighbours in the next layer: legible, not a hairball
  for (let l = 0; l < layers.length - 1; l++)
    nodes[l].forEach((p) => {
      [...nodes[l + 1]].sort((q1, q2) => Math.abs(q1[1] - p[1]) - Math.abs(q2[1] - p[1])).slice(0, 3).forEach((q) => edges.push([p, q]));
    });
  const flat = nodes.flat();
  return build(n, (a, o) => {
    if (r() < 0.24) {
      const p = pickOf(flat);
      put(a, o, p[0], p[1], p[2], 0.2);
    } else {
      const [p, q] = pickOf(edges);
      const t = r();
      const v = lerp3(p, q, t);
      put(a, o, v[0], v[1], v[2], 0.012);
    }
  });
}

/** 1 — the infrastructure: a rack of three servers. */
function rack(n: number) {
  const units = [-1.75, 0, 1.75];
  const H: V = [2.9, 0.68, 1.5];
  const edges = units.flatMap((y) => boxEdges([0, y, 0], H));
  return build(n, (a, o) => {
    const u = r();
    const y = pickOf(units);
    if (u < 0.5) {
      const [p, q] = pickOf(edges);
      const v = lerp3(p, q, r());
      put(a, o, v[0], v[1], v[2], 0.03);
    } else if (u < 0.78) {
      // drive bays: short slots on the front face
      const slot = (r() * 6) | 0;
      put(a, o, -2.3 + slot * 0.52 + (r() - 0.5) * 0.36, y - 0.1 + (r() - 0.5) * 0.04, H[2], 0.015);
    } else if (u < 0.9) {
      // status LEDs
      const led = (r() * 3) | 0;
      put(a, o, 2.15 + led * 0.2, y + 0.3, H[2], 0.05);
    } else {
      // top vents
      put(a, o, (r() * 2 - 1) * 2.6, y + H[1], (r() * 2 - 1) * 1.2, 0.01);
    }
  });
}

/** 2 — what I like to build: stacked blocks stepping upward. */
function blocks(n: number) {
  const heights = [
    [3, 2, 1],
    [2, 2, 1],
    [1, 1, 0],
  ];
  const S = 1.15;
  const gap = 0.26;
  const cubes: V[] = [];
  heights.forEach((row, ix) =>
    row.forEach((h, iz) => {
      for (let y = 0; y < h; y++) cubes.push([(ix - 1) * (S + gap), (y - 1) * (S + gap) + 0.4, (iz - 1) * (S + gap)]);
    }),
  );
  const half: V = [S / 2, S / 2, S / 2];
  const edges = cubes.flatMap((c) => boxEdges(c, half));
  return build(n, (a, o) => {
    if (r() < 0.92) {
      const [p, q] = pickOf(edges);
      const v = lerp3(p, q, r());
      put(a, o, v[0], v[1], v[2], 0.03);
    } else {
      const c = pickOf(cubes);
      const face = (r() * 3) | 0;
      const s = r() < 0.5 ? -1 : 1;
      const u = (r() - 0.5) * S;
      const w = (r() - 0.5) * S;
      const p: V = [c[0], c[1], c[2]];
      if (face === 0) { p[0] += s * half[0]; p[1] += u; p[2] += w; }
      else if (face === 1) { p[1] += s * half[1]; p[0] += u; p[2] += w; }
      else { p[2] += s * half[2]; p[0] += u; p[1] += w; }
      put(a, o, p[0], p[1], p[2], 0.01);
    }
  });
}

/** Half-width of the shield outline at normalised depth u (0 = shoulder, 1 = tip). */
const shieldX = (u: number, W: number) => W * Math.sqrt(Math.max(0, 1 - Math.pow(u, 1.7)));

/** 3 — security: a shield with a keyhole. */
function shield(n: number) {
  const W = 1.9;
  const top = 2.3;
  const shoulder = 0.4;
  const tip = -2.6;
  const outline = (scale: number, a: Float32Array, o: number, z: number) => {
    const k = r();
    const sx = r() < 0.5 ? -1 : 1;
    let x: number;
    let y: number;
    if (k < 0.3) { x = (r() * 2 - 1) * W; y = top; }
    else if (k < 0.5) { x = sx * W; y = shoulder + r() * (top - shoulder); }
    else { const u = r(); x = sx * shieldX(u, W); y = shoulder + (tip - shoulder) * u; }
    put(a, o, x * scale, (y - 0.1) * scale + 0.1, z, 0.025);
  };
  return build(n, (a, o) => {
    const u = r();
    const z = r() < 0.5 ? -0.28 : 0.28;
    if (u < 0.4) outline(1, a, o, z);
    else if (u < 0.58) outline(0.78, a, o, z);
    else if (u < 0.74) {
      // keyhole: ring + stem
      if (r() < 0.6) {
        const t = r() * TAU;
        put(a, o, Math.cos(t) * 0.5, 0.5 + Math.sin(t) * 0.5, z, 0.02);
      } else {
        put(a, o, (r() - 0.5) * 0.36, -0.15 - r() * 0.95, z, 0.02);
      }
    } else {
      // faint face of the shield
      const y = tip + r() * (top - tip);
      const lim = y > shoulder ? W : shieldX((shoulder - y) / (shoulder - tip), W);
      put(a, o, (r() * 2 - 1) * lim * 0.92, y, z * 0.4, 0.02);
    }
  });
}

/** 4 — observability: a graticule with a heartbeat trace. */
function pulse(n: number) {
  const G = (p: number, m: number, s: number) => Math.exp(-(((p - m) / s) ** 2));
  const trace = (x: number) => {
    const p = (((x + 6) / 3.1) % 1 + 1) % 1;
    return 0.35 * G(p, 0.18, 0.04) - 0.55 * G(p, 0.38, 0.012) + 2.5 * G(p, 0.42, 0.015) - 1 * G(p, 0.46, 0.015) + 0.55 * G(p, 0.7, 0.06);
  };
  return build(n, (a, o) => {
    const u = r();
    if (u < 0.55) {
      const x = (r() * 2 - 1) * 5.8;
      put(a, o, x, trace(x), 0, 0.045);
    } else if (u < 0.8) {
      // graticule: horizontal and vertical divisions
      if (r() < 0.5) put(a, o, (r() * 2 - 1) * 5.8, Math.round((r() * 2 - 1) * 3), -0.5, 0.01);
      else put(a, o, Math.round((r() * 2 - 1) * 5) * 1.16, (r() * 2 - 1) * 3, -0.5, 0.01);
    } else if (u < 0.92) {
      // frame
      const t = r() * 4;
      const e = (r() * 2 - 1);
      if (t < 1) put(a, o, e * 5.8, 3, -0.5, 0.015);
      else if (t < 2) put(a, o, e * 5.8, -3, -0.5, 0.015);
      else if (t < 3) put(a, o, 5.8, e * 3, -0.5, 0.015);
      else put(a, o, -5.8, e * 3, -0.5, 0.015);
    } else {
      // a bright scan head riding the trace
      const x = 3.1 + g() * 0.25;
      put(a, o, x, trace(x), 0, 0.1);
    }
  });
}

/** 5 — cloud-native: a ship's wheel, the Kubernetes helm. */
function wheel(n: number) {
  const R = 3.1;
  const spokes = 7;
  return build(n, (a, o) => {
    const u = r();
    if (u < 0.4) {
      const th = r() * TAU;
      const ph = r() * TAU;
      const tube = 0.2;
      const rad = R + Math.cos(ph) * tube;
      put(a, o, Math.cos(th) * rad, Math.sin(th) * rad, Math.sin(ph) * tube, 0.01);
    } else if (u < 0.75) {
      const k = (r() * spokes) | 0;
      const th = (k / spokes) * TAU - Math.PI / 2;
      const d = 0.55 + r() * (R + 0.55 - 0.55);
      put(a, o, Math.cos(th) * d, Math.sin(th) * d, 0, 0.05);
    } else if (u < 0.88) {
      const th = r() * TAU;
      const d = Math.sqrt(r()) * 0.7;
      put(a, o, Math.cos(th) * d, Math.sin(th) * d, g() * 0.18, 0.02);
    } else {
      const k = (r() * spokes) | 0;
      const th = (k / spokes) * TAU - Math.PI / 2;
      put(a, o, Math.cos(th) * (R + 0.9), Math.sin(th) * (R + 0.9), 0, 0.22);
    }
  });
}

/** 6 — reach: a globe with an orbit and satellites. */
function globe(n: number) {
  const R = 3.1;
  const tilt = 0.45;
  const orbit = (th: number): V => {
    const x = Math.cos(th) * 4.6;
    const z = Math.sin(th) * 4.6;
    return [x, -z * Math.sin(tilt), z * Math.cos(tilt)];
  };
  const sats = [0.4, 2.5, 4.4];
  return build(n, (a, o) => {
    const u = r();
    if (u < 0.5) {
      // parallels and meridians
      if (r() < 0.5) {
        const lat = (Math.round(r() * 8) / 8 - 0.5) * Math.PI * 0.94;
        const th = r() * TAU;
        put(a, o, Math.cos(lat) * Math.cos(th) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(th) * R, 0.012);
      } else {
        const lon = (((r() * 12) | 0) / 12) * TAU;
        const la = (r() - 0.5) * Math.PI;
        put(a, o, Math.cos(la) * Math.cos(lon) * R, Math.sin(la) * R, Math.cos(la) * Math.sin(lon) * R, 0.012);
      }
    } else if (u < 0.62) {
      // settlements: bright surface clusters
      const c = Math.floor(r() * 9);
      const lon = c * 2.4 + 0.5;
      const la = Math.sin(c * 1.9) * 0.9;
      put(a, o, Math.cos(la) * Math.cos(lon) * R, Math.sin(la) * R, Math.cos(la) * Math.sin(lon) * R, 0.09);
    } else if (u < 0.9) {
      const v = orbit(r() * TAU);
      put(a, o, v[0], v[1], v[2], 0.02);
    } else {
      const v = orbit(pickOf(sats));
      put(a, o, v[0], v[1], v[2], 0.16);
    }
  });
}

/** A trophy cup: the Hall of Fame landmark (game world only, not a morph target). */
export function trophy(n: number) {
  const bowl = (t: number) => 0.4 + 1.5 * Math.pow(Math.sin(t * 1.45), 0.9);
  return build(n, (a, o) => {
    const u = r();
    const th = r() * TAU;
    if (u < 0.55) {
      const t = r();
      const rad = bowl(t);
      const y = 0.9 + t * 2.3;
      const ring = r() < 0.35 ? Math.round(t * 8) / 8 : t; // horizontal bands
      const rr = bowl(ring);
      put(a, o, Math.cos(th) * (r() < 0.5 ? rad : rr), (r() < 0.5 ? y : 0.9 + ring * 2.3), Math.sin(th) * (r() < 0.5 ? rad : rr), 0.025);
    } else if (u < 0.65) put(a, o, Math.cos(th) * 0.2, -0.2 + r() * 1.2, Math.sin(th) * 0.2, 0.02);
    else if (u < 0.82) {
      const rad = 0.3 + r() * 1.3;
      put(a, o, Math.cos(th) * rad, -0.6 + (r() < 0.5 ? 0 : 0.4), Math.sin(th) * rad, 0.03);
    } else {
      const side = r() < 0.5 ? -1 : 1;
      const t = -Math.PI / 2 + r() * Math.PI;
      put(a, o, side * (1.85 + Math.cos(t) * 0.7), 2.3 + Math.sin(t) * 0.7, 0, 0.03);
    }
  });
}

/** Single builders, for scenes that need just one shape. */
export const SHAPE_BUILDERS = { net, rack, blocks, shield, pulse, wheel, globe, trophy };

export const makeShapes = (n: number) => [net(n), rack(n), blocks(n), shield(n), pulse(n), wheel(n), globe(n)];
