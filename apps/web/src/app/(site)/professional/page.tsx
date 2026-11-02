import type { Metadata } from "next";
import { WorldStage } from "@/components/world/world-stage";
import { professionalScenes } from "@/components/worlds/professional-scenes";

export const metadata: Metadata = { title: "Professional — Abishek Kumar" };

export default function ProfessionalPage() {
  return (
    <main>
      <WorldStage realm="professional" nav="rail" side={1} dim={0.12} scenes={professionalScenes()} />
    </main>
  );
}
