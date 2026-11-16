import type { Metadata } from "next";
import { MindMap } from "@/components/mindmap/mindmap";

export const metadata: Metadata = { title: "Hobby — Abishek Kumar" };

export default function HobbyPage() {
  return (
    <main>
      <MindMap initial="hobby" />
    </main>
  );
}
