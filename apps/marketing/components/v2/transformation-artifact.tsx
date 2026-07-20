"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo, useEffect, useState } from "react";

import type { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { NotesSheet, Stamp } from "./artifacts";

type Demo = typeof REPORT_TRANSFORMATION_DEMO;

/**
 * Artefact signature : la feuille de notes devient compte rendu.
 * Micro-interaction perpétuelle isolée ici (memo + interval nettoyé),
 * jamais dans le layout parent. Désactivée en reduced-motion.
 */
export const TransformationArtifact = memo(function TransformationArtifact({
  note,
  sections,
  ownerSummary,
  className = "",
}: {
  note: Demo["note"];
  sections: Demo["sections"];
  ownerSummary: Demo["ownerSummary"];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % sections.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [reduce, sections.length]);

  return (
    <div className={`grid items-center gap-6 md:grid-cols-[0.92fr_auto_1fr] ${className}`}>
      <div className="relative">
        <NotesSheet note={note} />
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute -bottom-1 left-16 h-4 w-px bg-[color:var(--v2-accent)]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 48 24"
        className="mx-auto h-5 w-10 rotate-90 text-[color:var(--v2-ink-faint)] md:rotate-0"
      >
        <motion.path
          d="M2 12 H40 M34 6 L42 12 L34 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>

      <figure className="relative rotate-[0.6deg] border border-[color:var(--v2-line)] bg-[color:var(--v2-sheet)] px-6 py-5 shadow-[0_24px_44px_-28px_rgba(28,25,23,0.5)]">
        <figcaption className="v2-mono mb-4 flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-3 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
          <span>Compte rendu · Biume</span>
          <span>Fig. 01</span>
        </figcaption>

        <dl className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.label} className="relative pl-4">
              {active === index && (
                <motion.span
                  layoutId="v2-pulse"
                  aria-hidden="true"
                  className="absolute left-0 top-1 bottom-1 w-[2px] bg-[color:var(--v2-accent)]"
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              )}
              <dt
                className={`v2-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  active === index
                    ? "text-[color:var(--v2-accent-deep)]"
                    : "text-[color:var(--v2-ink-faint)]"
                }`}
              >
                {section.label}
              </dt>
              <dd className="mt-0.5 text-[0.85rem] leading-snug text-[color:var(--v2-ink)]">
                {section.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="v2-display mt-4 border-t border-[color:var(--v2-line)] pt-3 text-[0.95rem] italic leading-snug text-[color:var(--v2-ink)]">
          «&nbsp;{ownerSummary}&nbsp;»
        </p>

        <div className="mt-4 flex justify-end">
          <Stamp>Relu &amp; validé par vous</Stamp>
        </div>
      </figure>
    </div>
  );
});
