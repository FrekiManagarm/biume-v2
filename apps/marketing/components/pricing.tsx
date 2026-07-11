"use client";

import Link from "next/link";
import { useState } from "react";

import { webAppPath } from "../lib/web-app-url";

type BillingCycle = "annual" | "monthly";

const billingOptions = {
  annual: {
    label: "Annuel",
    price: "24,99 €",
    suffix: "par mois, facturé annuellement",
    detail: "299,88 € facturés une fois par an",
  },
  monthly: {
    label: "Mensuel",
    price: "29,99 €",
    suffix: "par mois",
    detail: "Facturation mensuelle, résiliable à tout moment",
  },
} satisfies Record<
  BillingCycle,
  { label: string; price: string; suffix: string; detail: string }
>;

const includedGroups = [
  {
    title: "Suivi propriétaire",
    items: ["Résumés validés", "Timeline animal", "Relances J+7 et J+30"],
  },
  {
    title: "Pratique quotidienne",
    items: [
      "Patients et clients",
      "Documents illimités",
      "Support pendant l’essai",
    ],
  },
] as const;

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const billing = billingOptions[billingCycle];

  return (
    <section id="pricing" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-border p-6 md:p-10 lg:border-b-0 lg:border-r">
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
            Un abonnement simple. Une seule offre.
          </h2>
          <p className="mt-5 max-w-[54ch] text-base leading-7 text-muted-foreground">
            Essayez toutes les fonctionnalités pendant 15 jours, sans carte
            bancaire.
          </p>

          <div
            className="mt-8 grid gap-3 sm:grid-cols-2"
            role="group"
            aria-label="Choisir la facturation"
          >
            {(Object.keys(billingOptions) as BillingCycle[]).map((cycle) => {
              const option = billingOptions[cycle];
              const isSelected = billingCycle === cycle;

              return (
                <button
                  key={cycle}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setBillingCycle(cycle)}
                  className={
                    isSelected
                      ? "min-h-11 rounded-lg border border-foreground bg-foreground px-4 py-3 text-left text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "min-h-11 rounded-lg border border-border bg-background px-4 py-3 text-left text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
                  }
                >
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm opacity-75">
                    {option.price} par mois
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div aria-live="polite">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="whitespace-nowrap text-5xl font-semibold leading-none tracking-[-0.04em] text-foreground md:text-6xl">
                {billing.price}
              </span>
              <span className="pb-1 text-sm leading-5 text-muted-foreground">
                {billing.suffix}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {billing.detail}
            </p>
          </div>

          <div className="mt-8 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
            {includedGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-base font-semibold text-foreground">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <span
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-semibold text-secondary"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="leading-5 text-foreground/85">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
