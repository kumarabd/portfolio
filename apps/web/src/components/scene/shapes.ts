// Five point-cloud targets the particle body morphs between. Each returns a
// flat xyz array of n points. Index order is the shape id used by [data-stage].
export const SHAPE_COUNT = 5;

const r = Math.random;
const g = () => (r() + r() + r() - 1.5) * 0.67; // soft gaussian-ish, ~[-1,1]

type Fill = (i: number, out: Float32Array, o: number) => void;
const build = (n: number, fill: Fill) => {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) fill(i, a, i * 3);
  return a;
};

/** 0 — torus knot: the "signal". */
function knot(n: number) {
  return build(n, (_, a, o) => {
    const t = r() * Math.PI * 2;
    const R = 2.3 + Math.cos(3 * t) * 0.9;
    a[o] = R * Math.cos(2 * t) * 1.15 + g() * 0.14;
    a[o + 1] = R * Math.sin(2 * t) * 1.15 + g() * 0.14;
    a[o + 2] = Math.sin(3 * t) * 1.6 + g() * 0.14;
  });
}

/** 1 — a service graph: clustered nodes joined by edges. */
function network(n: number) {
  const K = 18;
  const nodes: [number, number, number][] = [];
  for (let i = 0; i < K; i++) {
    const y = 1 - (i / (K - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const j = 0.85 + r() * 0.3;
    nodes.push([Math.cos(th) * rad * 3.6 * j, y * 3.6 * j, Math.sin(th) * rad * 3.6 * j]);
  }
  const edges: [number, number][] = [];
  nodes.forEach((p, i) => {
    nodes
      .map((q, k) => ({ k, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2 }))
      .filter((e) => e.k !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach((e) => edges.push([i, e.k]));
  });
  return build(n, (_, a, o) => {
    if (r() < 0.32) {
      const p = nodes[(r() * K) | 0];
      a[o] = p[0] + g() * 0.42;
      a[o + 1] = p[1] + g() * 0.42;
      a[o + 2] = p[2] + g() * 0.42;
    } else {
      const [i, k] = edges[(r() * edges.length) | 0];
      const t = r();
      a[o] = nodes[i][0] + (nodes[k][0] - nodes[i][0]) * t + g() * 0.05;
      a[o + 1] = nodes[i][1] + (nodes[k][1] - nodes[i][1]) * t + g() * 0.05;
      a[o + 2] = nodes[i][2] + (nodes[k][2] - nodes[i][2]) * t + g() * 0.05;
    }
  });
}

/** 2 — a telemetry double helix with rungs. */
function helix(n: number) {
  return build(n, (_, a, o) => {
    const t = r() * 2 - 1;
    const ang = t * Math.PI * 5;
    if (r() < 0.2) {
      const s = r();
      a[o] = Math.cos(ang) * 1.7 * (1 - 2 * s);
      a[o + 2] = Math.sin(ang) * 1.7 * (1 - 2 * s);
    } else {
      const strand = r() < 0.5 ? 0 : Math.PI;
      a[o] = Math.cos(ang + strand) * 1.7 + g() * 0.09;
      a[o + 2] = Math.sin(ang + strand) * 1.7 + g() * 0.09;
    }
    a[o + 1] = t * 5 + g() * 0.05;
  });
}

/** 3 — a metric waveform field. */
function waves(n: number) {
  return build(n, (_, a, o) => {
    const x = (r() * 2 - 1) * 7.5;
    const z = (r() * 2 - 1) * 5;
    a[o] = x;
    a[o + 1] = Math.sin(x * 0.9) * 0.55 + Math.cos(z * 1.2) * 0.5 + Math.sin((x + z) * 0.55) * 0.45 - 0.6;
    a[o + 2] = z;
  });
}

/** 4 — a converging vortex. */
function vortex(n: number) {
  return build(n, (_, a, o) => {
    const rad = 0.5 + Math.pow(r(), 0.75) * 5;
    const ang = rad * 1.5 + ((r() * 3) | 0) * ((Math.PI * 2) / 3) + g() * 0.28;
    a[o] = Math.cos(ang) * rad;
    a[o + 1] = g() * 0.2 * (1 + rad * 0.18);
    a[o + 2] = Math.sin(ang) * rad;
  });
}

export const makeShapes = (n: number) => [knot(n), network(n), helix(n), waves(n), vortex(n)];
