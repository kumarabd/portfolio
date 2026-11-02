"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { signal } from "./signal";
import { makeShapes } from "./shapes";

const MUTE = new THREE.Color("#687b86");
const BONE = new THREE.Color("#e9eef0");

const VERT = /* glsl */ `
  // position = shape 0; a1..a6 = shapes 1..6
  attribute vec3 a1, a2, a3, a4, a5, a6;
  attribute float aSeed;
  uniform float uTime, uPixel, uExcite, uFrom, uTo, uT, uIntro, uDim;
  uniform vec2 uMouse;
  varying float vAlpha, vTone;

  vec3 pick(float k) {
    return position * step(abs(k), 0.5) + a1 * step(abs(k - 1.0), 0.5) + a2 * step(abs(k - 2.0), 0.5)
         + a3 * step(abs(k - 3.0), 0.5) + a4 * step(abs(k - 4.0), 0.5)
         + a5 * step(abs(k - 5.0), 0.5) + a6 * step(abs(k - 6.0), 0.5);
  }
  float ease(float x) { x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }

  void main() {
    float s = aSeed;
    // staggered per-particle morph so shapes pour into each other
    float t = ease(uT * 1.7 - s * 0.7);
    vec3 p = mix(pick(uFrom), pick(uTo), t);
    float burst = sin(t * 3.14159);
    vec3 dir = normalize(vec3(fract(s * 91.7) - 0.5, fract(s * 47.3) - 0.5, fract(s * 13.1) - 0.5) + 1e-3);
    p += dir * burst * (1.0 + s * 3.0);

    // living flow
    float w = uTime * (0.45 + uExcite * 0.9);
    p += vec3(sin(w + s * 40.0 + p.y * 1.3), cos(w * 1.1 + s * 30.0 + p.z * 1.3), sin(w * 0.9 + s * 20.0 + p.x * 1.3))
         * (0.06 + uExcite * 0.2);

    // intro: assemble from a far scatter
    vec3 sc = (vec3(fract(s * 71.3), fract(s * 33.7), fract(s * 19.9)) - 0.5) * 70.0;
    p = mix(sc, p, ease(uIntro * 1.8 - s * 0.8));

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec2 d = wp.xy - uMouse;
    wp.xy += normalize(d + 1e-4) * exp(-dot(d, d) * 0.3) * (1.1 + uExcite * 1.6);
    vec4 mv = viewMatrix * wp;
    gl_PointSize = uPixel * (1.0 + s * 2.2 + burst * 1.6) * (16.0 / -mv.z);
    float spark = step(0.94, fract(s * 53.0));
    vTone = clamp(fract(s * 29.0) * 0.55 + spark, 0.0, 1.0);
    vAlpha = (0.3 + 0.7 * fract(s * 17.0)) * (1.0 - uDim * 0.7) * (0.55 + 0.45 * smoothstep(20.0, 9.0, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uMute, uBone;
  varying float vAlpha, vTone;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(mix(uMute, uBone, vTone), smoothstep(0.5, 0.05, r) * vAlpha);
  }
`;

// per shape id: resting X tilt, and whether it turns all the way round (1) or
// only sways (0: flat or text-like shapes that must stay readable)
const TILT = [0.08, 0.28, 0.32, 0, 0.1, 0, 0.1];
const TURN = [0, 0, 1, 0, 0, 0, 1];
type Stage = { el: HTMLElement; shape: number; side: number; dim: number };
const smooth = (x: number) => (x = Math.min(1, Math.max(0, x))) * x * (3 - 2 * x);

export function SignalField() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the CSS gradient behind the canvas is the fallback
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth < 768;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 15;

    const N = small ? 16000 : 42000;
    const shapes = makeShapes(N);
    const seed = new Float32Array(N).map(() => Math.random());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    shapes.slice(1).forEach((s, i) => geo.setAttribute(`a${i + 1}`, new THREE.BufferAttribute(s, 3)));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPixel: { value: renderer.getPixelRatio() },
      uExcite: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uT: { value: 0 },
      uIntro: { value: reduced ? 1 : 0 },
      uDim: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMute: { value: MUTE },
      uBone: { value: BONE },
    };
    const body = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    body.frustumCulled = false;
    scene.add(body);

    // distant dust for depth
    const dustPos = new Float32Array(1600 * 3).map((_, i) => (i % 3 === 2 ? -Math.random() * 30 : (Math.random() - 0.5) * 60));
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: MUTE, size: 0.07, transparent: true, opacity: 0.45, depthWrite: false }),
    );
    scene.add(dust);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", onMove, { passive: true });

    // --- stages: [data-stage] elements choose shape / side / dim ---------
    let stages: Stage[] = [];
    let lastCount = -1;
    const readStages = () => {
      const els = [...document.querySelectorAll<HTMLElement>("[data-stage]")];
      if (els.length === lastCount && stages.every((s) => s.el.isConnected)) return;
      lastCount = els.length;
      stages = els.map((el) => ({
        el,
        shape: Number(el.dataset.stage),
        side: Number(el.dataset.side ?? 1),
        dim: Number(el.dataset.dim ?? 0),
      }));
    };

    let pos = 0; // continuous coordinate over the stage list
    let prevY = scrollY;
    let spin = 0;
    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    let time = 0;
    const vA = { side: 1, dim: 0, tilt: 0, turn: 0 };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduced) time += dt;
      readStages();

      // which shape are we on, and how far into the hand-off to the next?
      const line = scrollY + innerHeight * 0.55;
      let target = 0;
      if (stages.length) {
        const tops = stages.map((s) => s.el.getBoundingClientRect().top + scrollY);
        let i = 0;
        while (i + 1 < tops.length && tops[i + 1] <= line) i++;
        if (i + 1 < tops.length) {
          // the hand-off window shrinks for closely spaced stages so each shape still gets a rest
          const win = Math.min(innerHeight * 0.75, (tops[i + 1] - tops[i]) * 0.7);
          target = i + smooth(1 - (tops[i + 1] - line) / Math.max(win, 1));
        }
        else target = i;
      }
      pos += (target - pos) * (reduced ? 1 : 0.07);
      const i = Math.min(Math.floor(pos), Math.max(stages.length - 1, 0));
      const f = pos - i;
      const a = stages[i];
      const b = stages[Math.min(i + 1, stages.length - 1)] ?? a;
      uniforms.uFrom.value = a?.shape ?? 0;
      uniforms.uTo.value = b?.shape ?? 0;
      uniforms.uT.value = f;
      const e = smooth(f);
      const side = a ? a.side + ((b?.side ?? a.side) - a.side) * e : 1;
      const dim = a ? a.dim + ((b?.dim ?? a.dim) - a.dim) * e : 0;
      const tilt = a ? TILT[a.shape] + (TILT[b?.shape ?? a.shape] - TILT[a.shape]) * e : 0;
      const turn = a ? TURN[a.shape] + (TURN[b?.shape ?? a.shape] - TURN[a.shape]) * e : 0;
      vA.turn += (turn - vA.turn) * 0.1;
      vA.tilt += (tilt - vA.tilt) * 0.1;
      vA.side += (side - vA.side) * 0.1;
      vA.dim += (dim - vA.dim) * 0.1;

      const vel = (scrollY - prevY) / Math.max(dt, 0.001);
      prevY = scrollY;
      spin += Math.max(-0.05, Math.min(0.05, vel * 0.00004));
      spin *= 0.94;

      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;

      const intro = reduced ? 1 : Math.min(1, (now - t0) / 3200);
      uniforms.uIntro.value = intro;
      uniforms.uTime.value = time;
      uniforms.uExcite.value = signal.excite;
      uniforms.uDim.value = Math.max(vA.dim, small ? 0.45 : 0);
      uniforms.uMouse.value.set(mouse.sx * 9 + 99 * (mouse.x === 0 && mouse.y === 0 ? 1 : 0), mouse.sy * 5.5);

      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
      body.position.x = small ? 0 : vA.side * halfW * 0.5;
      body.position.y = small ? 2.2 : 0;
      body.scale.setScalar((small ? 0.62 : 1) * (1 + signal.excite * 0.06));
      body.rotation.y = vA.turn * time * 0.14 + (1 - vA.turn) * Math.sin(time * 0.35) * 0.45 + spin * 6 + mouse.sx * 0.35;
      body.rotation.x = vA.tilt + mouse.sy * 0.22 + Math.sin(time * 0.2) * 0.08;
      dust.position.y = scrollY * 0.004;
      dust.rotation.y = time * 0.01;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    host.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      dustGeo.dispose();
      body.material.dispose();
      dust.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} aria-hidden="true" className="signal-canvas" />;
}
