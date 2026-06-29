"use client";

import Link from "next/link";
import { useState } from "react";
import { webAppPath } from "../lib/web-app-url";

type BillingCycle = "annual" | "monthly";

const billingOptions: Record<
  BillingCycle,
  {
    label: string;
    price: string;
    statLabel: string;
    description: string;
    badge: string;
  }
> = {
  annual: {
    label: "Annuel",
    price: "24.99e",
    statLabel: "par mois annuel",
    description: "Facturation annuelle, soit 299.88e par an.",
    badge: "-17% annuel",
  },
  monthly: {
    label: "Mensuel",
    price: "29.99e",
    statLabel: "par mois mensuel",
    description: "Facturation mensuelle, annulable a tout moment.",
    badge: "Sans engagement",
  },
};

const included = [
  "Assistant IA pour rapports",
  "PDF personnalises avec votre identite",
  "Patients, clients et documents illimites",
  "Vulgarisation proprietaire",
  "Agenda et suivi de seance",
  "Support prioritaire pendant l'essai",
] as const;

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const billing = billingOptions[billingCycle];

  return (
    <section id="pricing" className="px-4 py-8 md:px-6 md:py-14">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_34px_100px_-76px_rgba(20,18,28,0.5)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-border p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tarifs
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
            Un tarif unique,{" "}
            <span className="text-foreground">
              tout inclus
            </span>
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground">
            Accédez à toutes les fonctionnalités sans limite. Sans frais
            cachés. Annulable à tout moment.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border py-4">
            {[
              ["15j", "essai gratuit"],
              ["0", "carte requise"],
              [billing.price, billing.statLabel],
            ].map(([value, label]) => (
              <div key={label} className="px-4 first:pl-0 last:pr-0">
                <p className="font-mono text-lg font-semibold tracking-tight text-foreground md:text-2xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium leading-4 text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/35 p-4 md:p-8">
          <div className="rounded-[1.7rem] border border-primary/15 bg-background p-5 shadow-[0_24px_70px_-58px_rgba(124,102,238,0.5)] md:p-7">
            <div
              className="mb-6 grid grid-cols-2 rounded-full border border-border bg-muted/45 p-1"
              aria-label="Choisir la facturation"
            >
              {(Object.keys(billingOptions) as BillingCycle[]).map((cycle) => {
                const isSelected = billingCycle === cycle;

                return (
                  <button
                    key={cycle}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setBillingCycle(cycle)}
                    className={
                      isSelected
                        ? "rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_28px_-24px_rgba(20,18,28,0.7)] transition-all"
                        : "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground"
                    }
                  >
                    {billingOptions[cycle].label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Plan complet
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-primary md:text-6xl">
                    {billing.price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / mois
                  </span>
                </div>
                <p className="mt-2 text-sm text-secondary">
                  {billing.description}
                </p>
              </div>
              <span className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                {billing.badge}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <CheckIcon />
                  </span>
                  <span className="text-sm leading-6 text-foreground/86">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold">
                  Commencez avec vos vrais dossiers.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vous pourrez annuler avant la fin de l&apos;essai.
                </p>
              </div>
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98]"
              >
                Demarrer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
      <path
        d="m3.5 8.2 2.6 2.5 6.4-6.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
