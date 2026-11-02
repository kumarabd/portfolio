import * as THREE from "three";
import gsap from "gsap";
import { SHAPE_BUILDERS } from "@/components/scene/shapes";
import type { RealmId } from "@/content/world";

export interface EngineOpts {
  items: { id: string; realm: RealmId }[];
  collected: string[];
  labels: Record<RealmId, string>;
  reduced: boolean;
  onCollect: (id: string) => void;
  onRealm: (realm: RealmId | null) => void;
}

export interface World {
  /** Leave the title screen and glide to a realm. */
  start: (realm: RealmId) => void;
  /** Fast travel to a realm's gate. */
  goTo: (realm: RealmId) => void;
  /** Back to the attract-mode orbit. */
  menu: () => void;
  markCollected: (id: string) => void;
  destroy: () => void;
}

const INK = 0x101820;
const BONE = 0xe9eef0;
const MUTE = 0x687b86;
const STEEL = 0x344b5c;

const HUB = new THREE.Vector3(0, 0, 0);
const LAND: Record<RealmId, { x: number; z: number; shape: keyof typeof SHAPE_BUILDERS; scale: number; y: number }> = {
  professional: { x: -16, z: -9, shape: "rack", scale: 1.15, y: 3.4 },
  hobby: { x: 16, z: -9, shape: "blocks", scale: 1.15, y: 2.8 },
  fame: { x: 0, z: 18, shape: "trophy", scale: 1.5, y: 2.6 },
};
const RING = 7.5; // item ring radius around each landmark
const SOLID = 3.8; // landmark collision radius
const NEAR_IN = 6.5;
const NEAR_OUT = 8.5;
const BOUNDS = { x: 32, zMin: -24, zMax: 28 };

// attenuate: true = world-sized points (shrink with distance); false = fixed pixel size, for far-field specks
const pointsMat = (size: number, color: number, opacity = 1, attenuate = true) =>
  new THREE.PointsMaterial({ size, color, transparent: true, opacity, sizeAttenuation: attenuate, depthWrite: false, blending: THREE.AdditiveBlending });

export function createWorld(host: HTMLElement, opts: EngineOpts): World {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(INK, 1);
  host.prepend(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none";

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(INK, 0.017);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const small = innerWidth < 768;

  // ---- ground: a fading measurement grid that follows the player ---------
  const groundMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uCenter: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(MUTE) } },
    vertexShader: `varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform vec2 uCenter; uniform vec3 uColor; varying vec2 vW;
      float grid(vec2 p, float s, float w){ vec2 q = p / s; vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q); return 1.0 - min(min(g.x, g.y) / w, 1.0); }
      void main(){
        float fade = smoothstep(38.0, 5.0, length(vW - uCenter));
        float a = (grid(vW, 2.0, 1.0) * 0.22 + grid(vW, 10.0, 1.4) * 0.5) * fade;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // ---- landmarks ----------------------------------------------------------
  const spinners: THREE.Object3D[] = [];
  const labelEls = {} as Record<RealmId, HTMLDivElement>;
  const labelBox = document.createElement("div");
  labelBox.className = "world-labels";
  host.appendChild(labelBox);

  (Object.keys(LAND) as RealmId[]).forEach((id) => {
    const L = LAND[id];
    const g = new THREE.Group();
    g.position.set(L.x, 0, L.z);
    scene.add(g);

    const n = small ? 4500 : 8000;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(SHAPE_BUILDERS[L.shape](n), 3));
    const body = new THREE.Points(geo, pointsMat(0.07, BONE, 0.9));
    body.scale.setScalar(L.scale);
    body.position.y = L.y;
    g.add(body);
    spinners.push(body);

    // beacon column so each realm can be spotted from the hub
    const colN = 420;
    const col = new Float32Array(colN * 3);
    for (let i = 0; i < colN; i++) {
      col[i * 3] = (Math.random() - 0.5) * 0.12;
      col[i * 3 + 1] = Math.random() * 22;
      col[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    const colGeo = new THREE.BufferGeometry();
    colGeo.setAttribute("position", new THREE.BufferAttribute(col, 3));
    g.add(new THREE.Points(colGeo, pointsMat(2.2, STEEL, 0.9, false)));

    // rings on the ground: the plinth and the item circle
    for (const [r, o] of [
      [4.2, 0.9],
      [RING, 0.35],
    ] as const) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.04, r, 128),
        new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      g.add(ring);
    }

    const el = document.createElement("div");
    el.className = "world-label";
    el.textContent = opts.labels[id];
    labelBox.appendChild(el);
    labelEls[id] = el;
  });

  // hub: where you spawn
  {
    const n = 900;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = i % 3 === 0 ? 3.2 : 2.4;
      a[i * 3] = Math.cos(t) * r;
      a[i * 3 + 1] = 0.05 + Math.random() * 0.05;
      a[i * 3 + 2] = Math.sin(t) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(a, 3));
    scene.add(new THREE.Points(geo, pointsMat(0.06, MUTE, 0.9)));
  }

  // ---- ambient dust -------------------------------------------------------
  {
    const n = 1400;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 90;
      a[i * 3 + 1] = Math.random() * 14;
      a[i * 3 + 2] = (Math.random() - 0.5) * 80 + 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(a, 3));
    const dust = new THREE.Points(geo, pointsMat(1.8, MUTE, 0.55, false));
    scene.add(dust);
    spinners.push(dust);
  }

  // ---- collectibles -------------------------------------------------------
  type Item = { id: string; group: THREE.Group; wire: THREE.Mesh; core: THREE.Mesh; x: number; z: number; got: boolean; phase: number };
  const items: Item[] = [];
  const octa = new THREE.OctahedronGeometry(0.5);
  (Object.keys(LAND) as RealmId[]).forEach((realm) => {
    const list = opts.items.filter((i) => i.realm === realm);
    const L = LAND[realm];
    const base = Math.atan2(HUB.z - L.z, HUB.x - L.x); // first item faces the hub
    list.forEach((it, k) => {
      const ang = base + ((k + 0.5) / list.length) * Math.PI * 2;
      const x = L.x + Math.cos(ang) * RING;
      const z = L.z + Math.sin(ang) * RING;
      const group = new THREE.Group();
      group.position.set(x, 1.3, z);
      const wire = new THREE.Mesh(octa, new THREE.MeshBasicMaterial({ color: BONE, wireframe: true, transparent: true }));
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22),
        new THREE.MeshBasicMaterial({ color: BONE, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      group.add(wire, core);
      scene.add(group);
      items.push({ id: it.id, group, wire, core, x, z, got: false, phase: Math.random() * 6 });
    });
  });
  const settle = (it: Item, animate: boolean) => {
    it.got = true;
    const tint = (m: THREE.Mesh, o: number) => {
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.setHex(MUTE);
      mat.opacity = o;
    };
    tint(it.wire, 0.6);
    tint(it.core, 0.25);
    if (animate) gsap.fromTo(it.group.scale, { x: 1.8, y: 1.8, z: 1.8 }, { x: 0.7, y: 0.7, z: 0.7, duration: 0.7, ease: "expo.out" });
    else it.group.scale.setScalar(0.7);
  };
  opts.collected.forEach((id) => {
    const it = items.find((i) => i.id === id);
    if (it) settle(it, false);
  });

  // ---- player: a small bright body with a fading trail --------------------
  const player = { x: 0, z: 5, vx: 0, vz: 0 };
  const orb = new THREE.Group();
  scene.add(orb);
  {
    const n = 520;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 0.4 * (0.6 + Math.random() * 0.4);
      a[i * 3] = Math.cos(t) * s * r;
      a[i * 3 + 1] = u * r;
      a[i * 3 + 2] = Math.sin(t) * s * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(a, 3));
    orb.add(new THREE.Points(geo, pointsMat(0.1, BONE)));
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.68, 48),
      new THREE.MeshBasicMaterial({ color: BONE, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.85;
    orb.add(halo);
  }
  const TRAIL = 56;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailCol = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
  const trail = new THREE.Points(
    trailGeo,
    new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  trail.frustumCulled = false;
  scene.add(trail);
  const white = new THREE.Color(BONE);

  // ---- pickup burst -------------------------------------------------------
  const BURST = 140;
  const bPos = new Float32Array(BURST * 3);
  const bVel = new Float32Array(BURST * 3);
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
  const bMat = pointsMat(0.12, BONE, 0);
  const burstPts = new THREE.Points(bGeo, bMat);
  burstPts.frustumCulled = false;
  scene.add(burstPts);
  let burstT = 1;
  const burst = (x: number, y: number, z: number) => {
    if (opts.reduced) return;
    for (let i = 0; i < BURST; i++) {
      bPos.set([x, y, z], i * 3);
      const d = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize().multiplyScalar(1.5 + Math.random() * 4);
      bVel.set([d.x, d.y, d.z], i * 3);
    }
    burstT = 0;
  };

  // ---- input --------------------------------------------------------------
  const keys = new Set<string>();
  let target: { x: number; z: number } | null = null;
  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["w", "a", "s", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k)) {
      if (mode !== "play") return;
      if (down) keys.add(k);
      else keys.delete(k);
      if (down) e.preventDefault();
    }
  };
  const kd = onKey(true);
  const ku = onKey(false);
  addEventListener("keydown", kd);
  addEventListener("keyup", ku);

  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  let dragging = false;
  const aim = (e: PointerEvent) => {
    if (mode !== "play" || gliding) return;
    const r = host.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)), camera);
    if (ray.ray.intersectPlane(plane, hit)) target = { x: hit.x, z: hit.z };
  };
  const canvas = renderer.domElement;
  const pd = (e: PointerEvent) => {
    dragging = true;
    aim(e);
  };
  const pm = (e: PointerEvent) => dragging && aim(e);
  const pu = () => (dragging = false);
  canvas.addEventListener("pointerdown", pd);
  addEventListener("pointermove", pm);
  addEventListener("pointerup", pu);

  // ---- state / camera -----------------------------------------------------
  let mode: "menu" | "play" = "menu";
  let gliding = false;
  let near: RealmId | null = null;
  let orbit = 0.6;
  const camPos = new THREE.Vector3(0, 15, 34);
  const look = new THREE.Vector3(0, 2, 4);
  const wantPos = new THREE.Vector3();
  const wantLook = new THREE.Vector3();

  const gate = (realm: RealmId) => {
    const L = LAND[realm];
    const d = new THREE.Vector3(HUB.x - L.x, 0, HUB.z - L.z).normalize();
    return { x: L.x + d.x * 11, z: L.z + d.z * 11 };
  };
  const travel = (realm: RealmId) => {
    const to = gate(realm);
    target = null;
    keys.clear();
    gsap.killTweensOf(player);
    if (opts.reduced) {
      player.x = to.x;
      player.z = to.z;
      return;
    }
    gliding = true;
    gsap.to(player, { x: to.x, z: to.z, duration: 1.6, ease: "power3.inOut", onComplete: () => (gliding = false) });
  };

  const resize = () => {
    const w = host.clientWidth || innerWidth;
    const h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ---- frame --------------------------------------------------------------
  let raf = 0;
  let last = performance.now();
  let time = 0;
  const v = new THREE.Vector3();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;

    if (mode === "play") {
      if (!gliding) {
        let ix = 0;
        let iz = 0;
        if (keys.has("a") || keys.has("ArrowLeft")) ix -= 1;
        if (keys.has("d") || keys.has("ArrowRight")) ix += 1;
        if (keys.has("w") || keys.has("ArrowUp")) iz -= 1;
        if (keys.has("s") || keys.has("ArrowDown")) iz += 1;
        let dx = 0;
        let dz = 0;
        if (ix || iz) {
          target = null;
          const m = Math.hypot(ix, iz);
          dx = ix / m;
          dz = iz / m;
        } else if (target) {
          const tx = target.x - player.x;
          const tz = target.z - player.z;
          const d = Math.hypot(tx, tz);
          if (d < 0.3) target = null;
          else {
            const s = Math.min(1, d / 2); // ease in to the target
            dx = (tx / d) * s;
            dz = (tz / d) * s;
          }
        }
        const k = 1 - Math.exp(-dt * 9);
        player.vx += (dx * 8 - player.vx) * k;
        player.vz += (dz * 8 - player.vz) * k;
        player.x = Math.min(BOUNDS.x, Math.max(-BOUNDS.x, player.x + player.vx * dt));
        player.z = Math.min(BOUNDS.zMax, Math.max(BOUNDS.zMin, player.z + player.vz * dt));
        // landmarks are solid: slide around them
        (Object.keys(LAND) as RealmId[]).forEach((id) => {
          const dx = player.x - LAND[id].x;
          const dz = player.z - LAND[id].z;
          const d = Math.hypot(dx, dz);
          if (d < SOLID && d > 0.001) {
            player.x = LAND[id].x + (dx / d) * SOLID;
            player.z = LAND[id].z + (dz / d) * SOLID;
          }
        });
      }

      // pickups
      for (const it of items) {
        if (it.got) continue;
        if (Math.hypot(it.x - player.x, it.z - player.z) < 1.5) {
          settle(it, true);
          burst(it.x, 1.3, it.z);
          opts.onCollect(it.id);
        }
      }

      // which realm are we in?
      let nearest: RealmId | null = null;
      let best = Infinity;
      (Object.keys(LAND) as RealmId[]).forEach((id) => {
        const d = Math.hypot(LAND[id].x - player.x, LAND[id].z - player.z);
        const lim = near === id ? NEAR_OUT + RING - 4 : NEAR_IN + RING - 4;
        if (d < lim && d < best) {
          best = d;
          nearest = id;
        }
      });
      if (nearest !== near) {
        near = nearest;
        opts.onRealm(near);
      }
    }

    // orb + trail
    const bob = Math.sin(time * 2.4) * 0.12;
    orb.visible = mode === "play";
    trail.visible = mode === "play";
    orb.position.set(player.x, 1.0 + bob, player.z);
    orb.rotation.y = time * 0.8;
    for (let i = TRAIL - 1; i > 0; i--) {
      trailPos[i * 3] = trailPos[(i - 1) * 3];
      trailPos[i * 3 + 1] = trailPos[(i - 1) * 3 + 1];
      trailPos[i * 3 + 2] = trailPos[(i - 1) * 3 + 2];
    }
    trailPos[0] = player.x;
    trailPos[1] = 0.9 + bob;
    trailPos[2] = player.z;
    const speed = Math.min(1, Math.hypot(player.vx, player.vz) / 4);
    for (let i = 0; i < TRAIL; i++) {
      const f = (1 - i / TRAIL) ** 2 * 0.55 * speed;
      trailCol[i * 3] = white.r * f;
      trailCol[i * 3 + 1] = white.g * f;
      trailCol[i * 3 + 2] = white.b * f;
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailGeo.attributes.color.needsUpdate = true;

    // items bob and turn
    for (const it of items) {
      it.group.position.y = 1.3 + Math.sin(time * 1.6 + it.phase) * 0.18;
      it.group.rotation.y = time * (it.got ? 0.3 : 0.9) + it.phase;
      it.group.rotation.x = it.got ? 0 : Math.sin(time * 0.7 + it.phase) * 0.3;
    }
    spinners.forEach((o, i) => (o.rotation.y = time * (i < 3 ? 0.16 : 0.01)));

    if (burstT < 1) {
      burstT += dt / 0.9;
      for (let i = 0; i < BURST; i++) {
        bPos[i * 3] += bVel[i * 3] * dt;
        bPos[i * 3 + 1] += bVel[i * 3 + 1] * dt;
        bPos[i * 3 + 2] += bVel[i * 3 + 2] * dt;
        bVel[i * 3 + 1] -= 4 * dt;
      }
      bGeo.attributes.position.needsUpdate = true;
      bMat.opacity = Math.max(0, 1 - burstT);
    } else bMat.opacity = 0;

    // camera: orbit the whole world on the title screen, follow the player in play
    if (mode === "menu") {
      if (!opts.reduced) orbit += dt * 0.07;
      wantPos.set(Math.sin(orbit) * 30, 16, Math.cos(orbit) * 22 + 4);
      // on wide screens push the world to the right of the title menu
      wantLook.set(camera.aspect > 1.1 ? -9 : 0, 2, 4);
    } else {
      const tall = camera.aspect < 0.8;
      wantPos.set(player.x, tall ? 15 : 11.5, player.z + (tall ? 11 : 13.5));
      wantLook.set(player.x, 0.6, player.z - 1.5);
    }
    const ck = 1 - Math.exp(-dt * (mode === "menu" ? 1.6 : 3.2));
    camPos.lerp(wantPos, ck);
    look.lerp(wantLook, ck);
    camera.position.copy(camPos);
    camera.lookAt(look);
    groundMat.uniforms.uCenter.value.set(mode === "play" ? player.x : 0, mode === "play" ? player.z : 4);

    // realm labels follow their landmarks
    (Object.keys(LAND) as RealmId[]).forEach((id) => {
      const L = LAND[id];
      v.set(L.x, L.y + 3.6, L.z).project(camera);
      const el = labelEls[id];
      const on = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      el.style.opacity = on ? (near === id ? "1" : "0.8") : "0";
      el.style.transform = `translate(${((v.x + 1) / 2) * host.clientWidth}px, ${((1 - v.y) / 2) * host.clientHeight}px) translate(-50%, -100%)`;
    });

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    start(realm) {
      mode = "play";
      player.x = 0;
      player.z = 6;
      player.vx = player.vz = 0;
      travel(realm);
    },
    goTo(realm) {
      mode = "play";
      travel(realm);
    },
    menu() {
      mode = "menu";
      target = null;
      keys.clear();
      gsap.killTweensOf(player);
      gliding = false;
      if (near) {
        near = null;
        opts.onRealm(null);
      }
    },
    markCollected(id) {
      const it = items.find((i) => i.id === id);
      if (it && !it.got) settle(it, false);
    },
    destroy() {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(player);
      items.forEach((it) => gsap.killTweensOf(it.group.scale));
      ro.disconnect();
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      removeEventListener("pointermove", pm);
      removeEventListener("pointerup", pu);
      canvas.removeEventListener("pointerdown", pd);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelBox.remove();
    },
  };
}
