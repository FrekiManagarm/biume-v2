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
      className="scroll-mt-20 bg-[color:var(--machine-violet-soft)] px-4 py-16 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start lg:gap-16">
          <div>
            <h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">
              Un prix simple pour prolonger chaque séance.
            </h2>
            <p className="mt-5 max-w-[48ch] text-base leading-7 text-[color:var(--machine-muted)] md:text-lg">
              15 jours pour tester l&apos;ensemble du parcours, sans carte
              bancaire.
            </p>

            <ul className="mt-8 grid gap-3 border-t border-[color:var(--machine-line)] pt-6">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[color:var(--machine-ink)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--machine-violet)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--machine-surface-radius)] border border-[color:var(--machine-line)] bg-[color:var(--machine-surface)] p-6 sm:p-8 lg:p-10">
            <PricingSelector options={billingOptions} />
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="machine-action mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--machine-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
