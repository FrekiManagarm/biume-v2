"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
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
  const reduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="px-4 py-20 md:px-6 md:py-28">
      <LazyMotion features={domAnimation} strict>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              Un abonnement simple. Une seule offre.
            </h2>
            <p className="mt-5 max-w-[50ch] text-base leading-7 text-muted-foreground">
              Essayez toutes les fonctionnalités pendant 15 jours, sans carte
              bancaire.
            </p>

            <div
              data-billing-selector
              className="mt-8 grid gap-2 rounded-xl bg-muted p-1.5 sm:grid-cols-2"
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
                    className="relative min-h-12 rounded-[10px] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {isSelected ? (
                      <m.span
                        layoutId="billing-selection"
                        className="absolute inset-0 rounded-[10px] bg-foreground"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    ) : null}
                    <span
                      className={`relative block text-sm font-semibold ${isSelected ? "text-background" : "text-foreground"}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`relative mt-1 block text-sm ${isSelected ? "text-background/75" : "text-muted-foreground"}`}
                    >
                      {option.price} par mois
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_30px_90px_-64px_var(--landing-shadow)] md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={billingCycle}
                data-billing-price
                aria-live="polite"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="whitespace-nowrap font-mono text-5xl font-semibold leading-none tracking-[-0.05em] text-foreground md:text-7xl">
                    {billing.price}
                  </span>
                  <span className="pb-1 text-sm leading-5 text-muted-foreground">
                    {billing.suffix}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {billing.detail}
                </p>
              </m.div>
            </AnimatePresence>

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
              className="landing-button mt-8 inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </LazyMotion>
    </section>
  );
}
