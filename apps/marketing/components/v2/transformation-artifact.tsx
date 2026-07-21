"use client";

import { useEffect, useState } from "react";

import { NotesSheet, V2Badge } from "./artifacts";
import type { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";

type Demo = typeof REPORT_TRANSFORMATION_DEMO;

const ACTIVE_MS = 2000;

/** Indicateur discret qui progresse section par section, en boucle. */
function useActiveSection(count: number): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, ACTIVE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  return active;
}

export function TransformationArtifact({
  note,
  sections,
  ownerSummary,
}: {
  note: Demo["note"];
  sections: Demo["sections"];
  ownerSummary: Demo["ownerSummary"];
}) {
  const active = useActiveSection(sections.length);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_auto_1.35fr] md:items-center md:gap-6">
      <div>
        <p className="v2-eyebrow mb-3">Notes de séance</p>
        <NotesSheet note={note} />
      </div>

      <div className="flex items-center justify-center" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 rotate-90 text-[color:var(--v2-accent)] md:rotate-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </div>

      <figure className="overflow-hidden rounded-xl border border-[color:var(--v2-line)] bg-[color:var(--v2-panel)] shadow-[0_1px_2px_rgba(23,23,23,0.05)]">
        <figcaption className="flex items-center justify-between gap-4 border-b border-[color:var(--v2-line)] px-5 py-3">
          <span className="v2-eyebrow">Compte rendu propriétaire</span>
          <V2Badge>Relu et validé par vous</V2Badge>
        </figcaption>
        <div className="divide-y divide-[color:var(--v2-line)]">
          {sections.map((section, index) => {
            const isActive = index === active;
            return (
              <div
                key={section.label}
                className={`grid gap-1 px-5 py-3.5 transition-colors duration-500 ${
                  isActive ? "bg-[color:var(--v2-accent-soft)]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                      isActive
                        ? "bg-[color:var(--v2-accent)]"
                        : "bg-[color:var(--v2-line-strong)]"
                    }`}
                  />
                  <p className="v2-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                    {section.label}
                  </p>
                </div>
                <p className="text-[0.85rem] leading-6 text-[color:var(--v2-ink)]">
                  {section.value}
                </p>
              </div>
            );
          })}
          <div className="px-5 py-3.5">
            <p className="v2-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
              En résumé
            </p>
            <p className="mt-1 text-[0.85rem] leading-6 text-[color:var(--v2-ink)]">
              «&nbsp;{ownerSummary}&nbsp;»
            </p>
          </div>
        </div>
      </figure>
    </div>
  );
}
