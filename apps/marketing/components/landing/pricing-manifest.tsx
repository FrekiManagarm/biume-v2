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
  cta: {
    href: string;
    label: string;
  };
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
    cta: {
      href: webAppPath("/signup"),
      label: "Essayer gratuitement",
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

        <div className="mt-10 border-t border-white/30 pt-6">
          <p className="text-pretty text-sm leading-6 text-white">
            Essai gratuit de 15 jours, sans carte bancaire. L’abonnement peut
            être arrêté depuis les paramètres.
          </p>
        </div>
      </div>
    </section>
  );
}
