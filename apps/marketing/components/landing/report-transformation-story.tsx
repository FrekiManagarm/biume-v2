"use client";

import { motion, useReducedMotion } from "motion/react";

import type { ReportTransformationDemo } from "./report-transformation-demo";

export function ReportTransformationStory({
  demo,
}: {
  demo: ReportTransformationDemo;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="produit"
      data-landing-section="transformation"
      className="scroll-mt-20 bg-[color:var(--machine-blue-soft)] px-4 py-16 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">
          Voyez vos notes prendre forme.
        </h2>
        <p className="mt-5 max-w-[65ch] text-pretty text-base leading-7 text-[color:var(--machine-muted)] md:text-lg">
          Le même regard métier, organisé pour être compris sans perdre sa
          précision.
        </p>
        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[0.8fr_auto_1fr_auto_1.1fr]">
          <article
            data-transformation-stage="notes"
            className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-anthracite)] p-6 text-white"
          >
            <h3 className="text-lg font-semibold">Notes de séance</h3>
            <p className="mt-5 text-sm leading-6 text-white/75">{demo.note}</p>
          </article>
          <motion.div
            aria-hidden="true"
            initial={false}
            whileInView={{ scaleX: 1 }}
            style={{ scaleX: reduceMotion ? 1 : 0.4 }}
            viewport={{ once: true, amount: 0.6 }}
            className="hidden h-1 w-12 self-center rounded-full bg-[color:var(--machine-blue)] lg:block"
          />
          <article
            data-transformation-stage="organized"
            className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] p-6"
          >
            <h3 className="text-lg font-semibold">Biume organise</h3>
            <dl className="mt-5 space-y-4">
              {demo.sections.map((section) => (
                <div key={section.label}>
                  <dt className="text-xs font-semibold text-[color:var(--machine-muted)]">
                    {section.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-6">{section.value}</dd>
                </div>
              ))}
            </dl>
          </article>
          <motion.div
            aria-hidden="true"
            initial={false}
            whileInView={{ scaleX: 1 }}
            style={{ scaleX: reduceMotion ? 1 : 0.4 }}
            viewport={{ once: true, amount: 0.6 }}
            className="hidden h-1 w-12 self-center rounded-full bg-[color:var(--machine-blue)] lg:block"
          />
          <article
            data-transformation-stage="review"
            className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Synthèse propriétaire</h3>
              <span className="rounded-full bg-[color:var(--machine-violet-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--machine-violet)]">
                Prêt à relire
              </span>
            </div>
            <p className="mt-5 text-sm leading-6">{demo.ownerSummary}</p>
            <p className="mt-5 border-t border-[color:var(--machine-line)] pt-4 text-xs text-[color:var(--machine-muted)]">
              Vous relisez avant chaque partage.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
