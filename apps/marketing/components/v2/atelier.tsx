"use client";

import { useRef } from "react";

import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { Reveal } from "./reveal";

/**
 * La démonstration : la note du praticien à gauche, le compte rendu
 * propriétaire à droite, un rail entre les deux.
 *
 * Le balisage rend l'**état final complet** et ne connaît rien du
 * mouvement. La séquence (`atelier-sequence.ts`) va chercher les nœuds
 * par attributs de données et les ramène à l'état de départ au montage.
 * Cette séparation est ce qui garantit qu'une page sans JavaScript reste
 * une démonstration lisible — et `/` est indexée.
 */

/**
 * Les trois fragments de la note, chacun rattaché au champ qu'il
 * alimente. Concaténés avec une espace, ils forment exactement
 * `REPORT_TRANSFORMATION_DEMO.note` : c'est la même démonstration que le
 * produit, pas une mise en scène écrite pour la landing.
 */
const FRAGMENTS = [
  "Restriction thoracique gauche.",
  "Mobilité améliorée après travail.",
  "Conseiller du calme pendant 48 h.",
] as const;

const SECTIONS = REPORT_TRANSFORMATION_DEMO.sections;

export function V2Atelier() {
  const root = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="produit"
      aria-labelledby="v2-atelier-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 pt-24 md:px-8 md:pt-32">
        <Reveal>
          <p className="v2-eyebrow">Le parcours</p>
          <h2
            id="v2-atelier-title"
            className="v2-display mt-5 max-w-[22ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[color:var(--v2-ink)] [text-wrap:balance]"
          >
            Ce que vous notez reste précis. Ce que le propriétaire lit devient
            clair.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[1rem] leading-[1.65] text-[color:var(--v2-ink-soft)] [text-wrap:pretty]">
            Vos observations ne sont ni résumées ni réinterprétées. Elles sont
            rangées, puis reformulées pour quelqu&apos;un qui n&apos;a pas votre
            vocabulaire.
          </p>
        </Reveal>
      </div>

      {/* Piste de défilement. Sur écran large, la séquence la pin et y
          calcule ses quatre temps ; en dessous, elle n'a pas de hauteur
          propre et la démonstration se lit au fil du scroll normal. */}
      <div data-atelier-track className="relative">
        <div data-atelier-stage>
          <div className="mx-auto w-full max-w-[1200px] px-5 py-14 md:px-8 md:py-16">
            <div
              ref={root}
              data-atelier-root
              className="relative grid gap-6 lg:grid-cols-[1fr_88px_1.08fr] lg:items-start lg:gap-0"
            >
              {/* ---------- La note du praticien ---------- */}
              <article className="v2-card p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
                  <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                    Vos notes de séance
                  </h3>
                  <p className="v2-mono text-[0.78rem] text-[color:var(--v2-ink-faint)]">
                    14:52
                  </p>
                </header>

                <p className="mt-6 text-[1.05rem] leading-[1.75] text-[color:var(--v2-ink)]">
                  {FRAGMENTS.map((fragment, index) => (
                    <span key={fragment}>
                      <span className="v2-fragment" data-fragment={index}>
                        {fragment}
                      </span>{" "}
                    </span>
                  ))}
                </p>

                <p className="mt-8 border-t border-[color:var(--v2-line)] pt-4 text-[0.85rem] text-[color:var(--v2-ink-faint)]">
                  Vos mots, tels que vous les avez écrits.
                </p>
              </article>

              {/* ---------- Le rail ---------- */}
              <div
                data-rail
                aria-hidden="true"
                className="hidden lg:block lg:self-stretch lg:py-10"
              >
                <svg
                  data-rail-svg
                  viewBox="0 0 88 320"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <line
                    className="v2-rail-line"
                    x1="44"
                    y1="0"
                    x2="44"
                    y2="320"
                  />
                  <line
                    data-rail-progress
                    className="v2-rail-progress"
                    x1="44"
                    y1="0"
                    x2="44"
                    y2="320"
                  />
                  {SECTIONS.map((section, index) => (
                    <circle
                      key={section.label}
                      data-rail-node={index}
                      data-lit="true"
                      className="v2-rail-node"
                      cx="44"
                      cy={64 + index * 96}
                      r="4"
                    />
                  ))}
                </svg>
              </div>

              {/* ---------- Le compte rendu propriétaire ---------- */}
              <article className="v2-card p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
                  <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                    Compte rendu pour le propriétaire
                  </h3>
                  <p data-seal className="v2-seal">
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
                      <path data-seal-check d="m3 8.5 3.2 3.2L13 5" />
                    </svg>
                    Validé par vous
                  </p>
                </header>

                <dl className="mt-6 space-y-5">
                  {SECTIONS.map((section, index) => (
                    <div
                      key={section.label}
                      className="border-l border-[color:var(--v2-line-strong)] pl-4"
                    >
                      <dt className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                        {section.label}
                      </dt>
                      <dd className="relative mt-1.5 text-[1rem] leading-[1.55] text-[color:var(--v2-ink)]">
                        {/* La cible du vol : elle occupe la place du
                            texte, le texte lui-même se révèle après. */}
                        <span
                          data-slot={index}
                          aria-hidden="true"
                          className="absolute left-0 top-0"
                        />
                        <span data-value={index}>{section.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Hauteur réservée : la bascule attente → document ne
                    déplace rien autour d'elle. */}
                <div className="relative mt-7 min-h-[9.5rem]">
                  <div
                    data-pending
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[10px] bg-[color:var(--v2-bone)] p-5 opacity-0"
                  >
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                      Ce que lit le propriétaire
                    </p>
                    <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--v2-ink-faint)]">
                      Rien pour l&apos;instant. Le document attend votre
                      relecture.
                    </p>
                  </div>
                  <div
                    data-owner
                    className="rounded-[10px] bg-[color:var(--v2-bone)] p-5"
                  >
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-violet-ink)]">
                      Ce que lit le propriétaire
                    </p>
                    <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--v2-ink)]">
                      {REPORT_TRANSFORMATION_DEMO.ownerSummary}
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-8 text-[0.82rem] text-[color:var(--v2-ink-faint)]">
              Démonstration à partir d&apos;un exemple de séance. Aucun envoi
              n&apos;est déclenché sans votre validation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
