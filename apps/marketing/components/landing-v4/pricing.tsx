import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, PLAN_INCLUDED, TRIAL_NOTE } from "./content";
import { Lit, Magnetic, Reveal } from "./motion";

const RHYTHMS = [
  {
    key: "Annuel",
    price: "24,99 €",
    unit: "par mois",
    note: "299,88 € facturés une fois par an",
  },
  {
    key: "Mensuel",
    price: "29,99 €",
    unit: "par mois",
    note: "Résiliable en fin de période",
  },
] as const;

/**
 * Tarifs. Une seule formule, deux rythmes posés côte à côte plutôt
 * que l'un caché derrière un interrupteur — l'un des deux est moins
 * cher, autant le dire d'emblée.
 *
 * Pas de « populaire », pas de faux troisième palier « Entreprise » :
 * il n'y a qu'une offre, et la page ne fait pas semblant du contraire.
 */
export function Pricing() {
  return (
    <section
      id="tarifs"
      aria-labelledby="lv4-tarifs-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
                <span aria-hidden="true" className="lv4-tick" />
                Tarifs
              </p>
            </Reveal>
            <Reveal as="h2">
              <span id="lv4-tarifs-title" className="lv4-h2 mt-6 block">
                Une formule. Tout le parcours.
              </span>
            </Reveal>
            <Reveal as="p">
              <span className="lv4-body mt-5 block text-[color:var(--lv4-text-2)]">
                Quinze jours d&apos;essai, sans carte bancaire.
                L&apos;abonnement s&apos;arrête depuis les paramètres de
                facturation, sans avoir à écrire à qui que ce soit.
              </span>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Lit className="lv4-surface overflow-hidden">
              <div className="grid sm:grid-cols-2">
                {RHYTHMS.map((rhythm, index) => (
                  <div
                    key={rhythm.key}
                    className={`px-6 py-7 md:px-8 ${
                      index === 0
                        ? "border-b border-[color:var(--lv4-line)] sm:border-b-0 sm:border-r"
                        : "bg-black/20"
                    }`}
                  >
                    <p className="lv4-note text-[color:var(--lv4-text-3)]">
                      {rhythm.key}
                    </p>
                    <p className="mt-4 flex items-baseline gap-2">
                      <span className="lv4-figure text-[2.6rem] leading-none">
                        {rhythm.price}
                      </span>
                      <span className="text-[0.92rem] text-[color:var(--lv4-text-3)]">
                        {rhythm.unit}
                      </span>
                    </p>
                    <p className="mt-3 text-[0.88rem] leading-[1.5] text-[color:var(--lv4-text-3)]">
                      {rhythm.note}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid border-t border-[color:var(--lv4-line)] lg:grid-cols-[1.1fr_0.9fr]">
                <div className="px-6 py-7 md:px-8">
                  <h3 className="lv4-note text-[color:var(--lv4-text-3)]">
                    Compris dans l&apos;abonnement
                  </h3>
                  <ul className="mt-4">
                    {PLAN_INCLUDED.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3.5 border-b border-[color:var(--lv4-line)] py-3 text-[0.95rem] leading-[1.5] last:border-b-0"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          className="mt-[3px] size-4 shrink-0 text-[color:var(--lv4-green)]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3 8.5 3.2 3.2L13 5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-center gap-3 border-t border-[color:var(--lv4-line)] px-6 py-7 md:px-8 lg:border-l lg:border-t-0">
                  <Magnetic strength={0.22} className="w-full">
                    <Link
                      href={webAppPath("/signup")}
                      prefetch={false}
                      data-conversion="pricing-signup"
                      className="lv4-btn lv4-btn-primary w-full"
                    >
                      Essayer gratuitement
                    </Link>
                  </Magnetic>
                  <a
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-conversion="pricing-demo"
                    className="lv4-btn lv4-btn-ghost w-full"
                  >
                    Demander une démonstration
                  </a>
                  <p className="lv4-note mt-1 text-center text-[color:var(--lv4-text-3)]">
                    {TRIAL_NOTE}
                  </p>
                </div>
              </div>
            </Lit>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
