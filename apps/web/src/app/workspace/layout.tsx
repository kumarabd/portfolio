import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-sans",
});
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira-code" });

export const metadata: Metadata = {
  title: "Workspace — MeSpace",
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`workspace-theme ${firaSans.variable} ${firaCode.variable}`}
      style={{ fontFamily: "var(--font-fira-sans)" }}
    >
      {children}
    </div>
  );
}
