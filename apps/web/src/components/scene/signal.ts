// Shared mutable state between DOM motion (GSAP) and the WebGL scene.
// Plain object on purpose: written/read every frame, no React re-renders.
export type SceneStage = { shape: number; side: number; dim: number; lift?: number; scale?: number };

export const signal = {
  /** 0..1 excitement, tweened by hovering [data-excite] elements. */
  excite: 0,
  /** A full-screen scene (the hub) owns the view: skip rendering the background field. */
  paused: false,
  /** Set by a pinned world page: a continuous position over its scenes. Null = read [data-stage] from the DOM. */
  deck: null as null | { pos: number; scenes: SceneStage[] },
};
