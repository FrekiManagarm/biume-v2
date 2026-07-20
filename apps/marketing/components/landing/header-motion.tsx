import type { ReactNode } from "react";

export function HeaderMotion({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <header
      data-header-motion
      className="sticky inset-x-0 top-0 z-40 border-b border-[color:var(--atelier-line)] bg-[color:var(--atelier-canvas)]"
    >
      <div className="mx-auto flex h-18 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}
