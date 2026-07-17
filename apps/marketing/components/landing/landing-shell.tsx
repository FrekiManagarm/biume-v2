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
      className={`${hanken.variable} soft-machine-theme min-h-dvh overflow-x-clip bg-[color:var(--machine-canvas)] font-[family-name:var(--font-hanken)] text-[color:var(--machine-ink)] selection:bg-[color:var(--machine-violet-soft)]`}
    >
      {children}
    </div>
  );
}
