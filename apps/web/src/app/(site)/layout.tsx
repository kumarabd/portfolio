import { Figtree, Fraunces, JetBrains_Mono } from "next/font/google";
import "./site.css";

const display = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT"], variable: "--font-display-face" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body-face" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face" });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`site ${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>;
}
