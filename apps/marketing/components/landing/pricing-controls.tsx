"use client";

import Link from "next/link";
import { useState, type JSX } from "react";

import type { BillingCycle, PricingPlan } from "./pricing-manifest";

const BILLING_CYCLES = ["annual", "monthly"] as const;

export function PricingControls({
  plans,
}: {
  plans: readonly PricingPlan[];
}): JSX.Element {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const selectedPlan = plans.find((plan) => plan.id === planId) ?? plans[0];

  if (!selectedPlan) {
    return <></>;
  }

  const selectedPrice = selectedPlan.prices[cycle];

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20">
        <div>
          <h2 className="max-w-[13ch] text-balance text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.035em]">
            {selectedPlan.headline}
          </h2>

          {plans.length > 1 ? (
            <div
              data-plan-selector
              role="group"
              aria-label="Choisir une formule"
              className="mt-8 flex flex-wrap gap-2"
            >
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPlanId(plan.id)}
                    className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      isSelected
                        ? "border-white bg-white text-[color:var(--atelier-violet)]"
                        : "border-white/60 bg-transparent text-white hover:border-white"
                    }`}
                  >
                    {plan.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <div
            data-billing-selector
            role="group"
            aria-label="Choisir la facturation"
            className="grid grid-cols-2 border-y border-white/30"
          >
            {BILLING_CYCLES.map((billingCycle) => {
              const price = selectedPlan.prices[billingCycle];
              const isSelected = billingCycle === cycle;

              return (
                <button
                  key={billingCycle}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setCycle(billingCycle)}
                  className={`min-h-11 px-3 py-3 text-left transition-colors first:border-r first:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:px-5 ${
                    isSelected
                      ? "bg-white text-[color:var(--atelier-violet)]"
                      : "bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {price.label}
                  </span>
                  <span className="mt-1 block font-mono text-xs">
                    {price.displayPrice} / mois
                  </span>
                </button>
              );
            })}
          </div>

          <div
            data-billing-price
            aria-live="polite"
            aria-atomic="true"
            className="mt-8"
          >
            <div key={`${selectedPlan.id}-${cycle}`}>
              <p className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <span className="font-mono text-[clamp(3rem,7vw,6rem)] font-semibold leading-none tracking-[-0.035em]">
                  {selectedPrice.displayPrice}
                </span>
                <span className="max-w-60 pb-1 text-sm leading-5 text-white">
                  {selectedPrice.suffix}
                </span>
              </p>
              <p className="mt-3 text-sm leading-6 text-white">
                {selectedPrice.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-12 divide-y divide-white/30 border-y border-white/30 lg:mt-16">
        {selectedPlan.included.map((item) => (
          <li
            key={item}
            className="grid gap-1 py-4 text-sm leading-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <span>{item}</span>
            <span className="text-white" aria-hidden="true">
              Inclus
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <Link
          href={selectedPlan.cta.href}
          prefetch={false}
          data-conversion="pricing-signup"
          className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[color:var(--atelier-violet)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {selectedPlan.cta.label}
        </Link>
      </div>
    </div>
  );
}
