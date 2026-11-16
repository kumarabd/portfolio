import type { Metadata } from "next";
import { MindMap } from "@/components/mindmap/mindmap";

export const metadata: Metadata = { title: "Hall of Fame — Abishek Kumar" };

export default function HallOfFamePage() {
  return (
    <main>
      <MindMap initial="fame" />
    </main>
  );
}
