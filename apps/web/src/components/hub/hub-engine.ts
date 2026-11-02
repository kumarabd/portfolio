import * as THREE from "three";
import gsap from "gsap";
import { SHAPE_BUILDERS } from "@/components/scene/shapes";
import type { RealmId } from "@/content/world";

export interface HubOpts {
  /** The real <a> for each world; the engine positions it under its landmark and clicks it to enter. */
  links: Record<RealmId, HTMLAnchorElement>;
  colors: Record<RealmId, string>;
  reduced: boolean;
}

const INK = 0x101820;
const MUTE = 0x687b86;
const ORDER: RealmId[] = ["professional", "hobby", "fame"];
const SHAPE_OF: Record<RealmId, keyof typeof SHAPE_BUILDERS> = { professional: "rack", hobby: "blocks", fame: "trophy" };
const SCALE_OF: Record<RealmId, number> = { professional: 1.05, hobby: 1.05, fame: 1.35 };
const LIFT_OF: Record<RealmId, number> = { professional: 0, hobby: 0, fame: 0.6 };

const pts = (size: number, color: THREE.ColorRepresentation, opacity: number, attenuate = true) =>
  new THREE.PointsMaterial({ size, color, transparent: true, opacity, sizeAttenuation: attenuate, depthWrite: false, blending: THREE.AdditiveBlending });

export function createHub(host: HTMLElement, opts: HubOpts) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(INK, 1);
  host.prepend(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(INK, 0.012);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const small = innerWidth < 768;

  // floor grid that fades out from the middle
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 260),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(MUTE) } },
      vertexShader: `varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `
        uniform vec3 uColor; varying vec2 vW;
        float grid(vec2 p, float s, float w){ vec2 q = p / s; vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q); return 1.0 - min(min(g.x, g.y) / w, 1.0); }
        void main(){
          float fade = smoothstep(46.0, 4.0, length(vW));
          gl_FragColor = vec4(uColor, (grid(vW, 2.0, 1.0) * 0.2 + grid(vW, 10.0, 1.4) * 0.45) * fade);
        }`,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4.6;
  scene.add(floor);

  // dust
  {
    const n = 1200;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 80;
      a[i * 3 + 1] = (Math.random() - 0.5) * 36;
      a[i * 3 + 2] = (Math.random() - 0.5) * 50 - 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    scene.add(new THREE.Points(g, pts(1.6, MUTE, 0.5, false)));
  }

  // the three worlds
  type Lm = { id: RealmId; group: THREE.Group; body: THREE.Points; mats: { body: THREE.PointsMaterial; ring: THREE.MeshBasicMaterial; col: THREE.PointsMaterial }; base: THREE.Vector3; hot: number; appear: { v: number } };
  const lms: Lm[] = ORDER.map((id) => {
    const group = new THREE.Group();
    scene.add(group);
    const n = small ? 5500 : 10000;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(SHAPE_BUILDERS[SHAPE_OF[id]](n), 3));
    const bodyMat = pts(0.085, opts.colors[id], 0.95);
    const body = new THREE.Points(geo, bodyMat);
    body.scale.setScalar(SCALE_OF[id]);
    body.position.y = LIFT_OF[id];
    group.add(body);

    // a ring under it and a column of light, in the world's colour
    const ringMat = new THREE.MeshBasicMaterial({ color: opts.colors[id], transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 3.66, 96), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -3.3;
    group.add(ring);
    const colN = 260;
    const col = new Float32Array(colN * 3);
    for (let i = 0; i < colN; i++) {
      col[i * 3] = (Math.random() - 0.5) * 0.1;
      col[i * 3 + 1] = -3.3 + Math.random() * 16;
      col[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    const cg = new THREE.BufferGeometry();
    cg.setAttribute("position", new THREE.BufferAttribute(col, 3));
    const colMat = pts(1.8, opts.colors[id], 0.35, false);
    group.add(new THREE.Points(cg, colMat));

    return { id, group, body, mats: { body: bodyMat, ring: ringMat, col: colMat }, base: new THREE.Vector3(), hot: 0, appear: { v: opts.reduced ? 1 : 0 } };
  });
  if (!opts.reduced) lms.forEach((l, i) => gsap.to(l.appear, { v: 1, duration: 1.6, delay: 0.25 + i * 0.22, ease: "expo.out" }));

  // layout: a row on wide screens, a column on portrait ones
  let portrait = false;
  const place = () => {
    portrait = camera.aspect < 1.05;
    host.dataset.layout = portrait ? "column" : "row";
    lms.forEach((l, i) => {
      if (portrait) l.base.set(-3.2, (1 - i) * 7.4 + 1, 0);
      else l.base.set((i - 1) * (camera.aspect > 1.9 ? 11.5 : 10), 2.2, 0);
      l.group.position.copy(l.base);
    });
  };
  const resize = () => {
    const w = host.clientWidth || innerWidth;
    const h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    place();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // hover: the landmark nearest the pointer (or focused/hovered label)
  let hover: RealmId | null = null;
  let labelHover: RealmId | null = null;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: -9999, py: -9999 };
  const onMove = (e: PointerEvent) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / innerHeight) * 2 - 1);
    mouse.px = e.clientX;
    mouse.py = e.clientY;
  };
  addEventListener("pointermove", onMove, { passive: true });
  const cleanups: (() => void)[] = [];
  ORDER.forEach((id) => {
    const a = opts.links[id];
    const on = () => (labelHover = id);
    const off = () => (labelHover = null);
    a.addEventListener("pointerenter", on);
    a.addEventListener("pointerleave", off);
    a.addEventListener("focus", on);
    a.addEventListener("blur", off);
    cleanups.push(() => {
      a.removeEventListener("pointerenter", on);
      a.removeEventListener("pointerleave", off);
      a.removeEventListener("focus", on);
      a.removeEventListener("blur", off);
    });
  });

  // clicking a landmark flies the camera into it while the page curtain closes
  const dolly = { v: 0, id: null as RealmId | null };
  const canvas = renderer.domElement;
  const onClick = () => {
    if (!hover || dolly.id) return;
    dolly.id = hover;
    if (!opts.reduced) gsap.to(dolly, { v: 1, duration: 0.7, ease: "power2.in" });
    opts.links[hover]?.click();
  };
  canvas.addEventListener("click", onClick);

  const proj = new THREE.Vector3();
  const toScreen = (v: THREE.Vector3) => {
    proj.copy(v).project(camera);
    return { x: ((proj.x + 1) / 2) * host.clientWidth, y: ((1 - proj.y) / 2) * host.clientHeight };
  };

  let raf = 0;
  let last = performance.now();
  let time = 0;
  const camBase = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += opts.reduced ? 0 : dt;

    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;

    // which landmark is the pointer closest to?
    let pick: RealmId | null = labelHover;
    if (!pick) {
      let best = Math.min(host.clientWidth, host.clientHeight) * (portrait ? 0.2 : 0.17);
      lms.forEach((l) => {
        tmp.copy(l.base).y += LIFT_OF[l.id] * 0.6;
        const s = toScreen(tmp);
        const d = Math.hypot(s.x - mouse.px, s.y - mouse.py);
        if (d < best) {
          best = d;
          pick = l.id;
        }
      });
    }
    if (pick !== hover) {
      hover = pick;
      canvas.style.cursor = hover ? "pointer" : "default";
    }

    lms.forEach((l, i) => {
      const hot = hover === l.id ? 1 : 0;
      l.hot += (hot - l.hot) * (1 - Math.exp(-dt * 7));
      const dim = hover && hover !== l.id ? 0.55 : 1;
      const s = l.appear.v * (1 + l.hot * 0.12) * (portrait ? 0.62 : small ? 0.8 : 1);
      l.group.scale.setScalar(Math.max(s, 0.0001));
      l.group.position.y = l.base.y + Math.sin(time * 0.9 + i * 2) * 0.22;
      l.body.rotation.y = time * (0.22 + l.hot * 0.5) + i;
      l.mats.body.opacity = 0.95 * dim * l.appear.v;
      l.mats.ring.opacity = (0.35 + l.hot * 0.5) * l.appear.v;
      l.mats.col.opacity = (0.25 + l.hot * 0.4) * l.appear.v;

      // the real link sits under (or beside) its landmark
      const el = opts.links[l.id];
      if (!el) return; // React already removed it (route change): the next frame won't run
      tmp.copy(l.base);
      if (portrait) {
        tmp.x += 3.0;
        const sc = toScreen(tmp);
        el.style.transform = `translate(${sc.x}px, ${sc.y}px) translate(0, -50%)`;
      } else {
        tmp.y -= 4.9 * (small ? 0.8 : 1);
        const sc = toScreen(tmp);
        el.style.transform = `translate(${sc.x}px, ${sc.y}px) translate(-50%, 0)`;
      }
      el.dataset.hot = hot ? "true" : "false";
      el.style.opacity = String(Math.min(1, l.appear.v * 1.4));
    });

    // camera drifts with the pointer; on click it dives into the chosen world
    camBase.set(mouse.sx * 1.6, 3.2 + mouse.sy * 0.9, portrait ? 33 : 26);
    lookAt.set(0, portrait ? 4.6 : 1.6, 0); // portrait: look higher so the worlds sit below the title
    if (dolly.id) {
      const t = lms.find((l) => l.id === dolly.id)!;
      camBase.lerp(tmp.copy(t.base).add(new THREE.Vector3(0, 0.5, 6)), dolly.v);
      lookAt.lerp(t.base, dolly.v);
    }
    camera.position.copy(camBase);
    camera.lookAt(lookAt);

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  host.dataset.live = "true";

  return {
    destroy() {
      cancelAnimationFrame(raf);
      lms.forEach((l) => gsap.killTweensOf(l.appear));
      gsap.killTweensOf(dolly);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      cleanups.forEach((c) => c());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.live;
    },
  };
}
