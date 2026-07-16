import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { PricingSelector, type BillingOptions } from "./pricing-selector";

export const billingOptions = {
  annual: {
    label: "Annuel",
    selectorPrice: "24,99 € / mois",
    price: "24,99 €",
    suffix: "par mois, facturé annuellement",
    detail: "299,88 € facturés une fois par an",
  },
  monthly: {
    label: "Mensuel",
    selectorPrice: "29,99 € / mois",
    price: "29,99 €",
    suffix: "par mois",
    detail: "Facturation mensuelle, résiliable en fin de période",
  },
} as const satisfies BillingOptions;

const included = [
  "Compte rendu structuré",
  "Adaptation du langage technique",
  "Prévisualisation et finalisation",
  "Export PDF professionnel",
  "Relance de rendez-vous planifiée",
] as const;

export function PricingDecision() {
  return (
    <section
      id="tarifs"
      data-landing-section="pricing"
      className="scroll-mt-18 border-y border-[color:var(--carnet-line)] px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div
          data-control-interlude
          className="grid gap-6 border-b border-[color:var(--carnet-line)] pb-10 md:pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
            Biume prépare.{" "}
            <span className="font-[family-name:var(--font-newsreader)] font-normal italic text-[color:var(--carnet-violet)]">
              Vous décidez.
            </span>
          </h2>
          <p className="max-w-[60ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8 lg:justify-self-end">
            Biume ne partage rien automatiquement. Vous relisez, corrigez et
            déclenchez vous-même le partage.
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-start lg:gap-16">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
              Une offre. Deux rythmes.
            </h2>
            <p className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
              Testez tout le parcours pendant 15 jours.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-3 border-t border-[color:var(--carnet-line)] pt-6 lg:grid-cols-1">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[color:var(--carnet-ink)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--carnet-green)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[0.8rem_0.8rem_2rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-6 shadow-[0_36px_90px_-62px_rgba(29,29,33,0.38)] sm:p-8 lg:p-10">
            <PricingSelector options={billingOptions} />
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="carnet-action mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
