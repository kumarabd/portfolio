"use client";

import dynamic from "next/dynamic";

// three.js is browser-only and heavy: keep it out of the server render and
// the initial JS path.
const SignalField = dynamic(() => import("./signal-field").then((m) => m.SignalField), { ssr: false });

export function SceneMount() {
  return <SignalField />;
}
