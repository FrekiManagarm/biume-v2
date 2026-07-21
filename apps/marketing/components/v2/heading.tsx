import type { ReactNode } from "react";

import { Reveal } from "./reveal";

/** En-tête de section : eyebrow mono + titre sans-serif serré + sous-titre. */
export function SectionIntro({
  eyebrow,
  title,
  children,
  align = "left",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "text-center" : undefined}>
      <p className="v2-eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className={`v2-display mt-4 text-balance text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-[color:var(--v2-ink)] ${
          centered ? "mx-auto max-w-[22ch]" : "max-w-[20ch]"
        }`}
      >
        {title}
      </h2>
      {children ? (
        <div
          className={`mt-5 text-pretty text-[1rem] leading-7 text-[color:var(--v2-ink-soft)] ${
            centered ? "mx-auto max-w-[56ch]" : "max-w-[54ch]"
          }`}
        >
          {children}
        </div>
      ) : null}
    </Reveal>
  );
}
