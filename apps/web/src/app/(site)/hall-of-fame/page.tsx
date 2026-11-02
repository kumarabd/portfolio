import type { Metadata } from "next";
import { WorldStage } from "@/components/world/world-stage";
import { fameScenes } from "@/components/worlds/fame-scenes";

export const metadata: Metadata = { title: "Hall of Fame — Abishek Kumar" };

export default function HallOfFamePage() {
  return (
    <main>
      <WorldStage realm="fame" nav="steps" side={0} dim={0.2} lift={2.7} scale={0.8} scenes={fameScenes()} />
    </main>
  );
}
