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
    price: "24,99 €",
    statLabel: "par mois annuel",
    description: "Facturation annuelle: 299,88 € par an.",
    badge: "Économisez 17%",
  },
  monthly: {
    label: "Mensuel",
    price: "29,99 €",
    statLabel: "par mois mensuel",
    description: "Facturation mensuelle, annulable à tout moment.",
    badge: "Sans engagement",
  },
};

const included = [
  "Assistant IA pour rapports",
  "Compte rendu propriétaire validé par vous",
  "Patients, clients et documents illimités",
  "Timeline animal et évolution",
  "Relances J+7 et J+30",
  "Support prioritaire pendant l'essai",
] as const;

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const billing = billingOptions[billingCycle];

  return (
    <section id="pricing" className="px-4 py-8 md:px-6 md:py-14">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-[0_38px_120px_-84px_rgba(20,18,28,0.62)] lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className="hero-color-wash pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(124,102,238,0.12),rgba(255,255,255,0)_38%,rgba(32,184,100,0.16)_72%,rgba(124,102,238,0.1))]"
          aria-hidden="true"
        />
        <div className="relative border-b border-border/80 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tarifs
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
            Un tarif simple,{" "}
            <span className="text-foreground">lié à la valeur du suivi</span>
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground">
            Un seul rendez-vous repris grâce à un suivi clair peut rembourser
            Biume. Essayez toutes les fonctionnalités sans carte bancaire.
          </p>

          <div
            className="mt-9 inline-grid grid-cols-2 rounded-full border border-border bg-background/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur"
            role="radiogroup"
            aria-label="Choisir la facturation"
          >
            {(Object.keys(billingOptions) as BillingCycle[]).map((cycle) => {
              const isSelected = billingCycle === cycle;
              const option = billingOptions[cycle];

              return (
                <button
                  key={cycle}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setBillingCycle(cycle)}
                  className={
                    isSelected
                      ? "rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-[0_18px_34px_-28px_rgba(20,18,28,0.82)] transition-all active:scale-[0.98]"
                      : "rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground active:scale-[0.98]"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative bg-background/38 p-4 backdrop-blur-sm md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(20,18,28,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,18,28,0.035)_1px,transparent_1px)] bg-size-[48px_48px]"
            aria-hidden="true"
          />

          <div className="relative rounded-[1.85rem] border border-white/70 bg-background/88 p-5 shadow-[0_30px_90px_-70px_rgba(20,18,28,0.66)] backdrop-blur-xl md:p-7">
            <div className="flex items-start justify-between gap-6 border-b border-border pb-6">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  Plan complet
                </p>
                <p className="mt-3 max-w-64 text-sm font-medium leading-6 text-muted-foreground">
                  {billing.description}
                </p>
              </div>
              <span className="rounded-full border border-secondary/20 bg-secondary/8 px-3 py-1.5 text-xs font-semibold text-secondary">
                {billing.badge}
              </span>
            </div>

            <div className="mt-7 flex items-end gap-3">
              <span className="whitespace-nowrap text-6xl font-semibold leading-none tracking-tight text-foreground md:text-7xl">
                {billing.price}
              </span>
              <span className="pb-2 text-sm font-medium text-muted-foreground">
                / mois
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 border-y border-border py-5">
              <div>
                <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  15 j
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  essai gratuit
                </p>
              </div>
              <div className="border-l border-border pl-5">
                <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  0 CB
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  au démarrage
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-secondary">
                    <CheckIcon />
                  </span>
                  <span className="text-sm leading-6 text-foreground/86">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-[0_18px_42px_-32px_rgba(20,18,28,0.78)] transition-all hover:bg-foreground/88 active:scale-[0.98]"
            >
              Démarrer l&apos;essai
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      aria-hidden="true"
    >
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
