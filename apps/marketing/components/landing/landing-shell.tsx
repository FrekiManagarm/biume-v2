import { Hanken_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${hanken.variable} atelier-theme min-h-dvh overflow-x-clip bg-[color:var(--atelier-canvas)] font-[family-name:var(--font-hanken)] text-[color:var(--atelier-ink)] selection:bg-[color:var(--atelier-violet-soft)]`}
    >
      {children}
    </div>
  );
}
