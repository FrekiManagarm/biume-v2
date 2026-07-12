"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
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
  const reduceMotion = useReducedMotion();
  const selected = options[cycle];

  return (
    <LazyMotion features={domAnimation} strict>
      <div>
        <div
          data-billing-selector
          role="group"
          aria-label="Choisir la facturation"
          className="grid gap-1 rounded-xl bg-[color:var(--carnet-muted-surface)] p-1.5 sm:grid-cols-2"
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
                className={`relative min-h-12 rounded-[0.6rem] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)] ${
                  isSelected ? "text-white" : "text-[color:var(--carnet-ink)]"
                }`}
              >
                {isSelected ? (
                  <m.span
                    layoutId="carnet-billing-selection"
                    className="absolute inset-0 rounded-[0.6rem] bg-[color:var(--carnet-ink)]"
                    transition={
                      reduceMotion === true
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <span className="relative block text-sm font-semibold">
                  {option.label}
                </span>
                <span
                  className={`relative mt-1 block font-mono text-xs ${
                    isSelected
                      ? "text-white/70"
                      : "text-[color:var(--carnet-muted)]"
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
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={cycle}
              initial={reduceMotion === true ? false : { opacity: 0.72, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduceMotion === true
                  ? { opacity: 1 }
                  : { opacity: 0.72, y: -6 }
              }
              transition={{
                duration: reduceMotion === true ? 0 : 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="font-mono text-5xl font-semibold leading-none tracking-[-0.055em] text-[color:var(--carnet-ink)] md:text-7xl">
                  {selected.price}
                </span>
                <span className="max-w-52 pb-1 text-sm leading-5 text-[color:var(--carnet-muted)]">
                  {selected.suffix}
                </span>
              </div>
              <p className="mt-3 text-sm text-[color:var(--carnet-muted)]">
                {selected.detail}
              </p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
