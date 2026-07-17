import Link from "next/link";
import type { JSX } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { PricingControls } from "./pricing-controls";

export type BillingCycle = "annual" | "monthly";

export type BillingPrice = {
  label: string;
  displayPrice: string;
  suffix: string;
  detail: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  headline: string;
  included: readonly string[];
  prices: Record<BillingCycle, BillingPrice>;
};

export const PRICING_PLANS = [
  {
    id: "independent",
    name: "Indépendant",
    headline: "Tout le parcours. Un seul abonnement.",
    included: [
      "Compte rendu propriétaire structuré",
      "Reformulation et validation passage par passage",
      "Export PDF professionnel",
      "Suivi et rappel après séance",
    ],
    prices: {
      annual: {
        label: "Annuel",
        displayPrice: "24,99 €",
        suffix: "par mois, facturé annuellement",
        detail: "299,88 € facturés une fois par an",
      },
      monthly: {
        label: "Mensuel",
        displayPrice: "29,99 €",
        suffix: "par mois",
        detail: "Facturation mensuelle, résiliable en fin de période",
      },
    },
  },
] as const satisfies readonly PricingPlan[];

export function PricingManifest({
  plans = PRICING_PLANS,
}: {
  plans?: readonly PricingPlan[];
}): JSX.Element {
  return (
    <section
      id="tarifs"
      data-landing-section="pricing"
      className="scroll-mt-20 bg-[color:var(--atelier-violet)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <PricingControls plans={plans} />

        <div className="mt-10 flex flex-col gap-4 border-t border-white/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-pretty text-sm leading-6 text-white">
            Essai gratuit de 15 jours, sans carte bancaire.
          </p>
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="pricing-signup"
            className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[color:var(--atelier-violet)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
