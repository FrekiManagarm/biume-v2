import type { ReactNode } from "react";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="soft-machine-theme min-h-dvh overflow-x-clip bg-[color:var(--machine-canvas)] font-[family-name:var(--font-hanken)] text-[color:var(--machine-ink)] selection:bg-[color:var(--machine-violet-soft)]">
      {children}
    </div>
  );
}
