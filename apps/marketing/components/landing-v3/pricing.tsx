import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./chapters";
import { Reveal } from "./motion";

/** Une seule formule, deux rythmes de facturation présentés côte à
 *  côte plutôt que l'un enfoui sous l'autre. */
const INCLUDED = [
  "Compte rendu propriétaire structuré à partir de vos notes",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

export function Pricing() {
  return (
    <section
      id="tarifs"
      aria-labelledby="lv3-tarifs-title"
      className="scroll-mt-24 bg-[color:var(--lv3-canvas)]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8 md:py-32">
        <Reveal as="h2">
          <span
            id="lv3-tarifs-title"
            className="lv3-chapter-title block max-w-[16ch] text-[color:var(--lv3-ink)]"
          >
            Tout le parcours. Un seul abonnement.
          </span>
        </Reveal>
        <Reveal as="p">
          <span className="lv3-lead mt-5 block text-[color:var(--lv3-ink-2)]">
            Essai gratuit de 15 jours, sans carte bancaire. L&apos;abonnement
            s&apos;arrête depuis les paramètres de facturation.
          </span>
        </Reveal>

        <Reveal>
          <div className="lv3-surface mt-12 overflow-hidden">
            <div className="grid divide-y divide-[color:var(--lv3-line)] md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-7 md:p-9">
                <p className="lv3-fn text-[color:var(--lv3-ink-2)]">
                  FACTURATION ANNUELLE
                </p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-[3rem] font-bold leading-none tracking-[-0.03em] text-[color:var(--lv3-ink)]">
                    24,99 €
                  </span>
                  <span className="text-[0.95rem] text-[color:var(--lv3-ink-2)]">
                    / mois
                  </span>
                </p>
                <p className="mt-3 text-[0.9rem] text-[color:var(--lv3-ink-2)]">
                  299,88 € facturés une fois par an.
                </p>
              </div>

              <div className="bg-[color:var(--lv3-muted)] p-7 md:p-9">
                <p className="lv3-fn text-[color:var(--lv3-ink-2)]">
                  FACTURATION MENSUELLE
                </p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-[3rem] font-bold leading-none tracking-[-0.03em] text-[color:var(--lv3-ink)]">
                    29,99 €
                  </span>
                  <span className="text-[0.95rem] text-[color:var(--lv3-ink-2)]">
                    / mois
                  </span>
                </p>
                <p className="mt-3 text-[0.9rem] text-[color:var(--lv3-ink-2)]">
                  Résiliable en fin de période.
                </p>
              </div>
            </div>

            <div className="border-t border-[color:var(--lv3-line)] p-7 md:p-9">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                <div>
                  <h3 className="lv3-fn text-[color:var(--lv3-ink-2)]">
                    COMPRIS DANS L&apos;ABONNEMENT
                  </h3>
                  <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                    {INCLUDED.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-b border-[color:var(--lv3-line)] py-3.5 text-[0.95rem] leading-[1.5] text-[color:var(--lv3-ink)] last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          className="mt-0.5 size-4 shrink-0 text-[color:var(--lv3-green)]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3 8.5 3.2 3.2L13 5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[0.9rem] leading-[1.6] text-[color:var(--lv3-ink-2)]">
                    Biume complète votre organisation actuelle. Il ne remplace
                    pas votre logiciel de gestion.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    data-conversion="pricing-signup"
                    className="lv3-btn lv3-btn-primary w-full"
                  >
                    Essayer gratuitement
                  </Link>
                  <a
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-conversion="pricing-demo"
                    className="lv3-btn lv3-btn-secondary w-full"
                  >
                    Demander une démonstration
                  </a>
                  <p className="text-center text-[0.85rem] text-[color:var(--lv3-ink-2)]">
                    {TRIAL_NOTE}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
