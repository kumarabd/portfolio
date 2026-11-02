import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { SceneMount } from "@/components/scene/scene-mount";
import { SiteFooter } from "@/components/site-footer";
import { SiteMotion } from "@/components/site-motion";
import { SiteNav } from "@/components/site-nav";
import "./site.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-display-face" });
const body = Inter({ subsets: ["latin"], variable: "--font-body-face" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face" });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${display.variable} ${body.variable} ${mono.variable}`}>
      <SceneMount />
      <SiteNav />
      <SiteMotion />
      <div className="site-content">
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
