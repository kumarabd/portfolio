import { Geist_Mono, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { SceneMount } from "@/components/scene/scene-mount";
import { SiteFooter } from "@/components/site-footer";
import { SiteMotion } from "@/components/site-motion";
import { SiteNav } from "@/components/site-nav";
import "./site.css";

const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${instrument.variable} ${hanken.variable} ${geistMono.variable}`}>
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
