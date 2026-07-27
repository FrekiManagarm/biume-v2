import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { Reveal } from "./motion";

/**
 * Chapitre 02 — la transformation, posée sur le plan violet doux.
 *
 * Le violet doux est le fond de mise en contexte du système : c'est
 * l'endroit où le praticien décide. Le violet saturé, lui, reste
 * réservé aux décisions elles-mêmes et n'est jamais promu en surface.
 *
 * Composition verticale : la note d'abord, ses fragments ensuite,
 * chacun montré avec le texte d'origine au-dessus de sa reformulation.
 * La correspondance est lisible à l'arrêt — aucune animation n'est
 * nécessaire pour comprendre, elle ne fait qu'accompagner.
 */

const FRAGMENTS = [
  "Restriction thoracique gauche.",
  "Mobilité améliorée après travail.",
  "Conseiller du calme pendant 48 h.",
] as const;

const SECTIONS = REPORT_TRANSFORMATION_DEMO.sections;

export function Atelier() {
  return (
    <section
      id="atelier"
      aria-labelledby="lv3-atelier-title"
      className="scroll-mt-24 bg-[color:var(--lv3-violet-soft)]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8 md:py-32">
        <Reveal as="h2">
          <span
            id="lv3-atelier-title"
            className="lv3-chapter-title mx-auto block max-w-[18ch] text-center text-[color:var(--lv3-ink)]"
          >
            Vos observations ne sont ni résumées ni réinterprétées.
          </span>
        </Reveal>
        <Reveal as="p">
          <span className="lv3-lead mx-auto mt-5 block text-center text-[color:var(--lv3-ink-2)]">
            Elles sont rangées, puis reformulées pour quelqu&apos;un qui
            n&apos;a pas votre vocabulaire.
          </span>
        </Reveal>

        <div className="mx-auto mt-14 max-w-[680px]">
          {/* La note brute */}
          <Reveal>
            <article className="lv3-surface p-6 md:p-8">
              <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv3-line)] pb-4">
                <h3 className="text-[1.05rem] font-semibold text-[color:var(--lv3-ink)]">
                  Vos notes de séance
                </h3>
                <p className="lv3-fn text-[color:var(--lv3-ink-2)]">14:52</p>
              </header>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-[color:var(--lv3-ink)]">
                {FRAGMENTS.join(" ")}
              </p>
            </article>
          </Reveal>

          {/* Le passage — un trait, pas une flèche décorative */}
          <Reveal>
            <div
              aria-hidden="true"
              className="mx-auto flex h-14 w-px justify-center bg-[color:var(--lv3-blue)]"
            />
          </Reveal>

          {/* Le document propriétaire */}
          <Reveal>
            <article className="lv3-surface overflow-hidden">
              <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv3-line)] px-6 py-4 md:px-8">
                <h3 className="text-[1.05rem] font-semibold text-[color:var(--lv3-ink)]">
                  Compte rendu pour le propriétaire
                </h3>
                <span className="lv3-validated">
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
                </span>
              </header>

              <dl className="divide-y divide-[color:var(--lv3-line)]">
                {SECTIONS.map((section, index) => (
                  <div key={section.label} className="px-6 py-5 md:px-8">
                    <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--lv3-ink-2)]">
                      {section.label}
                    </dt>
                    {/* Le mot d'origine reste visible au-dessus de sa
                        reformulation : la correspondance est montrée,
                        pas affirmée. */}
                    <p className="mt-2 text-[0.85rem] italic leading-[1.5] text-[color:var(--lv3-ink-2)]">
                      {FRAGMENTS[index]}
                    </p>
                    <dd className="mt-1.5 text-[1.05rem] leading-[1.55] text-[color:var(--lv3-ink)]">
                      {section.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-[color:var(--lv3-line)] bg-[color:var(--lv3-blue-soft)] px-6 py-6 md:px-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--lv3-blue-ink)]">
                  Ce que reçoit le propriétaire
                </p>
                <p className="mt-2 text-[1.05rem] leading-[1.6] text-[color:var(--lv3-ink)]">
                  {REPORT_TRANSFORMATION_DEMO.ownerSummary}
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal>
            <p className="mt-6 text-center text-[0.82rem] text-[color:var(--lv3-ink-2)]">
              Démonstration à partir d&apos;un exemple de séance. Aucun envoi
              n&apos;est déclenché sans votre validation.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
