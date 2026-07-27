import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./constants";
import { Reveal } from "./motion";

/** Une seule formule : les deux rythmes de facturation sont donnés côte
 *  à côte plutôt qu'enfouis l'un sous l'autre. */
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
      aria-labelledby="lv2-tarifs-title"
      className="scroll-mt-20 border-t border-[color:var(--lv2-line)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-32">
        <Reveal as="h2">
          <span
            id="lv2-tarifs-title"
            className="lv2-headline block max-w-[16ch] text-[color:var(--lv2-ink)]"
          >
            Tout le parcours. Un seul abonnement.
          </span>
        </Reveal>
        <Reveal as="p">
          <span className="lv2-body mt-5 block">
            Essai gratuit de 15 jours, sans carte bancaire. L&apos;abonnement
            s&apos;arrête depuis les paramètres de facturation.
          </span>
        </Reveal>

        <Reveal>
          <div className="lv2-surface mt-12 grid overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-[color:var(--lv2-line)] p-7 md:p-10 lg:border-b-0 lg:border-r">
              <h3 className="lv2-title text-[color:var(--lv2-ink)]">
                Formule Indépendant
              </h3>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-[2.9rem] font-bold leading-none tracking-[-0.035em] text-[color:var(--lv2-ink)]">
                  24,99 €
                </span>
                <span className="text-[0.95rem] text-[color:var(--lv2-ink-2)]">
                  / mois
                </span>
              </p>
              <p className="mt-2 text-[0.9rem] text-[color:var(--lv2-ink-2)]">
                En facturation annuelle —{" "}
                <span className="lv2-fn">299,88 €</span> une fois par an.
              </p>

              <div className="mt-6 border-t border-[color:var(--lv2-line)] pt-6">
                <p className="flex items-baseline gap-2">
                  <span className="text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-[color:var(--lv2-ink)]">
                    29,99 €
                  </span>
                  <span className="text-[0.95rem] text-[color:var(--lv2-ink-2)]">
                    / mois
                  </span>
                </p>
                <p className="mt-2 text-[0.9rem] text-[color:var(--lv2-ink-2)]">
                  En facturation mensuelle, résiliable en fin de période.
                </p>
              </div>

              <div className="mt-9 flex flex-col gap-3">
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  data-conversion="pricing-signup"
                  className="lv2-btn lv2-btn-primary w-full"
                >
                  Essayer gratuitement
                </Link>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion="pricing-demo"
                  className="lv2-btn lv2-btn-secondary w-full"
                >
                  Demander une démonstration
                </a>
              </div>
              <p className="mt-4 text-center text-[0.85rem] text-[color:var(--lv2-ink-2)]">
                {TRIAL_NOTE}
              </p>
            </div>

            <div className="bg-[color:var(--lv2-muted)] p-7 md:p-10">
              <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink-2)]">
                Compris dans l&apos;abonnement
              </h3>
              <ul className="mt-5 divide-y divide-[color:var(--lv2-line)] border-y border-[color:var(--lv2-line)]">
                {INCLUDED.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 py-4 text-[0.95rem] leading-[1.55] text-[color:var(--lv2-ink)]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="mt-0.5 size-4 shrink-0 text-[color:var(--lv2-green)]"
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
              <p className="mt-5 text-[0.9rem] leading-[1.6] text-[color:var(--lv2-ink-2)]">
                Biume complète votre organisation actuelle. Il ne remplace pas
                votre logiciel de gestion.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
