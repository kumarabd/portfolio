// Shared mutable state between DOM motion (GSAP) and the WebGL scene.
// Plain object on purpose: written/read every frame, no React re-renders.
export const signal = {
  /** 0..1 excitement, tweened by hovering [data-excite] elements. */
  excite: 0,
};
