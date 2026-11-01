import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PROFILE } from "@/content/profile";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

// This deployed instance is personalized via content/profile.ts — the
// underlying template/app identity ("MeSpace") lives only in the
// generator tag and the footer credit, not in visitor-facing copy.
export const metadata: Metadata = {
  title: `${PROFILE.name} — ${PROFILE.role}`,
  description: `${PROFILE.role} building small, focused tools. Portfolio, projects, and what I care about.`,
  generator: "MeSpace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", jetbrainsMono.variable)}>
      <body className={jetbrainsMono.className}>{children}</body>
    </html>
  );
}
