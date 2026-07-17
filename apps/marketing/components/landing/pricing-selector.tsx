"use client";

import { useState } from "react";

export type BillingCycle = "annual" | "monthly";

export type BillingOption = Readonly<{
  label: string;
  selectorPrice: string;
  price: string;
  suffix: string;
  detail: string;
}>;

export type BillingOptions = Readonly<Record<BillingCycle, BillingOption>>;

export type PricingSelectorProps = Readonly<{
  options: BillingOptions;
  defaultCycle?: BillingCycle;
}>;

export function PricingSelector({
  options,
  defaultCycle = "annual",
}: PricingSelectorProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const selected = options[cycle];

  return (
    <div>
      <div
        data-billing-selector
        role="group"
        aria-label="Choisir la facturation"
        className="grid gap-1 rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-muted-surface)] p-1.5 sm:grid-cols-2"
      >
        {(Object.keys(options) as BillingCycle[]).map((optionCycle) => {
          const option = options[optionCycle];
          const isSelected = optionCycle === cycle;

          return (
            <button
              key={optionCycle}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setCycle(optionCycle)}
              className={`relative min-h-12 rounded-[var(--machine-control-radius)] px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)] ${
                isSelected ? "text-white" : "text-[color:var(--machine-ink)]"
              }`}
            >
              {isSelected ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[var(--machine-control-radius)] bg-[color:var(--machine-anthracite)]"
                />
              ) : null}
              <span className="relative block text-sm font-semibold">
                {option.label}
              </span>
              <span
                className={`relative mt-1 block font-mono text-xs ${
                  isSelected
                    ? "text-white/70"
                    : "text-[color:var(--machine-muted)]"
                }`}
              >
                {option.selectorPrice}
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
        <div key={cycle}>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <span className="font-mono text-5xl font-semibold leading-none tracking-[-0.04em] text-[color:var(--machine-ink)] md:text-7xl">
              {selected.price}
            </span>
            <span className="max-w-52 pb-1 text-sm leading-5 text-[color:var(--machine-muted)]">
              {selected.suffix}
            </span>
          </div>
          <p className="mt-3 text-sm text-[color:var(--machine-muted)]">
            {selected.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
