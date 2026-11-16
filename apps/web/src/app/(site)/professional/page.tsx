import type { Metadata } from "next";
import { MindMap } from "@/components/mindmap/mindmap";

export const metadata: Metadata = { title: "Professional — Abishek Kumar" };

export default function ProfessionalPage() {
  return (
    <main>
      <MindMap initial="professional" />
    </main>
  );
}
