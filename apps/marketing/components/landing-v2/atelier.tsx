"use client";

import { useRef } from "react";

import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { useScrollBeats } from "./motion";

/**
 * Les trois fragments de la note du praticien, chacun rattaché au champ
 * qu'il alimente dans le compte rendu. Le texte provient de
 * REPORT_TRANSFORMATION_DEMO : c'est la même démonstration que le produit,
 * pas une mise en scène inventée pour la landing.
 */
const FRAGMENTS = [
  "Restriction thoracique gauche.",
  "Mobilité améliorée après travail.",
  "Conseiller du calme pendant 48 h.",
] as const;

const SECTIONS = REPORT_TRANSFORMATION_DEMO.sections;

/** 0 → rien · 1-3 → champs renseignés · 4 → relu et validé. */
const LAST_BEAT = 4;

export function Atelier() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const beat = useScrollBeats({ trackRef, count: LAST_BEAT });

  const sealed = beat === LAST_BEAT;

  return (
    <section
      id="atelier"
      aria-labelledby="lv2-atelier-title"
      className="scroll-mt-20 border-t border-[color:var(--lv2-line)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 pt-24 md:px-8 md:pt-32">
        <h2
          id="lv2-atelier-title"
          className="lv2-headline max-w-[20ch] text-[color:var(--lv2-ink)]"
        >
          Ce que vous notez reste précis. Ce que le propriétaire lit devient
          clair.
        </h2>
        <p className="lv2-body mt-5">
          Vos observations ne sont ni résumées ni réinterprétées. Elles sont
          rangées, puis reformulées pour quelqu&apos;un qui n&apos;a pas votre
          vocabulaire.
        </p>
      </div>

      {/* Piste de défilement : sur écran large elle pilote la
          transformation ; en dessous, elle n'existe pas. */}
      <div ref={trackRef} className="relative lg:h-[300vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:items-center">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-14 md:px-8 md:py-16">
            {/* Les deux panneaux gardent leur hauteur propre : la note est
                courte, le document est long, et c'est précisément le
                propos. Seul le rail s'étire pour relier les deux. */}
            <div className="grid gap-6 lg:grid-cols-[1fr_72px_1.08fr] lg:items-start lg:gap-0">
              {/* ---------- La note du praticien ---------- */}
              <article className="lv2-surface p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv2-line)] pb-4">
                  <h3 className="lv2-title text-[color:var(--lv2-ink)]">
                    Vos notes de séance
                  </h3>
                  <p className="lv2-fn text-[color:var(--lv2-ink-2)]">14:52</p>
                </header>

                <p className="mt-6 text-[1.05rem] leading-[1.75] text-[color:var(--lv2-ink)]">
                  {FRAGMENTS.map((fragment, index) => (
                    <span key={fragment}>
                      <span
                        className="lv2-fragment"
                        data-active={beat === index + 1 ? "true" : undefined}
                      >
                        {fragment}
                      </span>{" "}
                    </span>
                  ))}
                </p>

                <p className="mt-8 border-t border-[color:var(--lv2-line)] pt-4 text-[0.85rem] text-[color:var(--lv2-ink-2)]">
                  Vos mots, tels que vous les avez écrits.
                </p>
              </article>

              {/* ---------- Le fil de liaison ---------- */}
              <div
                aria-hidden="true"
                className="hidden lg:flex lg:h-full lg:min-h-[320px] lg:items-stretch lg:justify-center lg:self-stretch lg:py-10"
              >
                <div className="relative w-px bg-[color:var(--lv2-line)]">
                  <div
                    className="absolute inset-x-0 top-0 h-full origin-top bg-[color:var(--lv2-blue)] transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ transform: `scaleY(${Math.min(beat, 3) / 3})` }}
                  />
                  {SECTIONS.map((section, index) => (
                    <span
                      key={section.label}
                      className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-[320ms]"
                      style={{
                        top: `${(index + 1) * 25 + 8}%`,
                        backgroundColor:
                          beat > index
                            ? "var(--lv2-blue)"
                            : "var(--lv2-canvas)",
                        borderColor:
                          beat > index
                            ? "var(--lv2-blue)"
                            : "var(--lv2-line)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ---------- Le compte rendu propriétaire ---------- */}
              <article className="lv2-surface p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv2-line)] pb-4">
                  <h3 className="lv2-title text-[color:var(--lv2-ink)]">
                    Compte rendu pour le propriétaire
                  </h3>
                  <p
                    className="lv2-validated lv2-seal"
                    data-pending={sealed ? undefined : "true"}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 8.5 3.2 3.2L13 5" />
                    </svg>
                    Validé par vous
                  </p>
                </header>

                <dl className="mt-6 space-y-5">
                  {SECTIONS.map((section, index) => (
                    <div
                      key={section.label}
                      className="lv2-field pl-4"
                      data-pending={beat > index ? undefined : "true"}
                    >
                      <dt className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink-2)]">
                        {section.label}
                      </dt>
                      <dd className="lv2-field-value mt-1.5 text-[1rem] leading-[1.55] text-[color:var(--lv2-ink)]">
                        {section.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Hauteur réservée : la bascule attente → document ne
                    déplace rien autour d'elle. */}
                <div className="mt-7 flex min-h-[9.5rem] flex-col justify-end">
                  {sealed ? (
                    <div className="lv2-appear rounded-[10px] bg-[color:var(--lv2-blue-soft)] p-5">
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-blue-ink)]">
                        Ce que lit le propriétaire
                      </p>
                      <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--lv2-ink)]">
                        {REPORT_TRANSFORMATION_DEMO.ownerSummary}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[10px] bg-[color:var(--lv2-muted)] p-5">
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink-2)]">
                        Ce que lit le propriétaire
                      </p>
                      <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--lv2-ink-2)]">
                        Rien pour l&apos;instant. Le document attend votre
                        relecture.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            </div>

            <p className="mt-8 text-[0.82rem] text-[color:var(--lv2-ink-2)]">
              Démonstration à partir d&apos;un exemple de séance. Aucun envoi
              n&apos;est déclenché sans votre validation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
