"use client";

import Link from "next/link";
import { useState } from "react";

import { DEMO_URL, PRICING_DEMO_CARD, PRICING_LEAD, PRICING_PLAN, PRICING_TITLE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

type Billing = "mois" | "an";

export function LandingV5Pricing() {
  const [billing, setBilling] = useState<Billing>("mois");
  const plan = billing === "mois" ? PRICING_PLAN.monthly : PRICING_PLAN.annual;

  return (
    <section
      id="tarifs"
      aria-labelledby="tarifs-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="tarifs-title"
              className="max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {PRICING_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[32ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)]">
              {PRICING_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap items-stretch gap-[clamp(20px,3vw,36px)]">
          <Reveal className="flex min-w-[300px] flex-1 basis-[400px] flex-col gap-[22px] rounded-2xl border border-[color:var(--lv5-violet)] bg-[color:var(--lv5-surface)] p-[clamp(24px,3vw,38px)]">
            <div
              data-billing-selector=""
              className="inline-flex w-fit gap-1 self-start rounded-full bg-[color:var(--lv5-surface-muted)] p-1"
            >
              <button
                type="button"
                aria-pressed={billing === "mois"}
                onClick={() => setBilling("mois")}
                className={`min-h-11 rounded-full px-4 text-[0.84rem] font-semibold transition-colors duration-[350ms] ${
                  billing === "mois"
                    ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-ink)]"
                    : "text-[color:var(--lv5-ink-soft)]"
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                aria-pressed={billing === "an"}
                onClick={() => setBilling("an")}
                className={`min-h-11 rounded-full px-4 text-[0.84rem] font-semibold transition-colors duration-[350ms] ${
                  billing === "an"
                    ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-ink)]"
                    : "text-[color:var(--lv5-ink-soft)]"
                }`}
              >
                Annuel
              </button>
            </div>

            <div data-billing-price="" aria-live="polite" aria-atomic="true">
              <p className="flex items-end gap-2">
                <span className="text-[clamp(2.6rem,5vw,4rem)] font-[650] leading-none tracking-[-0.035em] text-[color:var(--lv5-ink)]">
                  {plan.price}
                </span>
                <span className="pb-1.5 text-[1rem] font-medium text-[color:var(--lv5-ink-soft)]">
                  par mois
                </span>
              </p>
              <p className="mt-2.5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-ink-soft)]">
                {plan.note}
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {PRICING_PLAN.included.map((item) => (
                <li key={item} className="flex gap-[11px] text-[1rem] leading-[1.5]">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] size-[7px] flex-none rounded-full bg-[color:var(--lv5-green)]"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="min-h-11 inline-flex items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-[26px] text-[0.98rem] font-semibold text-white shadow-[var(--lv5-shadow-focus)]"
            >
              {PRICING_PLAN.cta}
            </Link>
            <p className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">{PRICING_PLAN.ctaNote}</p>
          </Reveal>

          <Reveal
            delay={120}
            className="flex min-w-[280px] flex-1 basis-[300px] flex-col gap-4 rounded-2xl bg-[color:var(--lv5-violet-soft)] p-[clamp(24px,3vw,38px)]"
          >
            <h3 className="text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--lv5-ink)]">
              {PRICING_DEMO_CARD.title}
            </h3>
            <p className="text-[1rem] leading-[1.6] text-[color:var(--lv5-ink-mid)] [text-wrap:pretty]">
              {PRICING_DEMO_CARD.body}
            </p>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="pricing-demo"
              className="min-h-11 inline-flex w-fit items-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-6 text-[0.96rem] font-semibold text-[color:var(--lv5-ink)]"
            >
              {PRICING_DEMO_CARD.cta}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
