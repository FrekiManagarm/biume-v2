"use client";

import { useState } from "react";

import {
  DEMO_URL,
  PRICING_DEMO_CARD,
  PRICING_EYEBROW,
  PRICING_LEAD,
  PRICING_PLAN,
  PRICING_TITLE,
} from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const plan = PRICING_PLAN[billing];

  return (
    <section
      id="tarifs"
      aria-labelledby="pricing-title"
      className="bg-[color:var(--lv5-surface-muted)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] text-center">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
          {PRICING_EYEBROW}
        </p>
        <h2 id="pricing-title" className="mt-2 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-0.04em]">
          {PRICING_TITLE}
        </h2>
        <p className="mx-auto mt-4 max-w-[54ch] text-[color:var(--lv5-ink-soft)]">
          {PRICING_LEAD}
        </p>

        <div
          role="group"
          aria-label="Rythme de facturation"
          className="mx-auto mt-8 inline-flex rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-1"
        >
          <button
            type="button"
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className="min-h-11 rounded-full px-5 text-sm font-semibold aria-pressed:bg-[color:var(--lv5-violet)] aria-pressed:text-white"
          >
            Mensuel
          </button>
          <button
            type="button"
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
            className="min-h-11 rounded-full px-5 text-sm font-semibold aria-pressed:bg-[color:var(--lv5-violet)] aria-pressed:text-white"
          >
            Annuel
            <span className="ml-1.5 rounded-full bg-[color:var(--lv5-green-soft)] px-1.5 py-0.5 text-[0.68rem] text-[color:var(--lv5-green-ink)]">
              −2 mois
            </span>
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-[820px] gap-6 text-left md:grid-cols-2">
          <Reveal>
            <article className="relative rounded-[24px] border-2 border-[color:var(--lv5-violet)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]">
              <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--lv5-violet)] px-3 py-1 text-xs font-semibold text-white">
                {PRICING_PLAN.badge}
              </span>
              <p className="text-[clamp(2.6rem,5vw,3.8rem)] font-[650] leading-none tracking-[-0.04em]">
                {plan.price}
                <span className="ml-1 text-base font-normal text-[color:var(--lv5-ink-soft)]">
                  par mois
                </span>
              </p>
              <p className="mt-2 text-sm text-[color:var(--lv5-ink-soft)]">{plan.note}</p>
              <ul className="mt-6 divide-y divide-[color:var(--lv5-line)]">
                {PRICING_PLAN.included.map((item) => (
                  <li key={item} className="flex items-start gap-2 py-2.5 text-sm">
                    <span aria-hidden="true" className="mt-0.5 text-[color:var(--lv5-green)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={webAppPath("/signup")}
                data-conversion="pricing-signup"
                className="mt-6 flex min-h-13 items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-6 text-sm font-semibold text-white shadow-[var(--lv5-shadow-cta)]"
              >
                {PRICING_PLAN.ctaLabel}
              </a>
              <p className="mt-3 text-center text-xs text-[color:var(--lv5-ink-tertiary)]">
                {PRICING_PLAN.cta}
              </p>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="flex h-full flex-col justify-between rounded-[24px] bg-[color:var(--lv5-anthracite)] p-[clamp(22px,4vw,32px)] text-[rgba(253,253,251,.82)]">
              <div>
                <h3 className="text-[1.2rem] font-semibold text-[color:var(--lv5-surface)]">
                  {PRICING_DEMO_CARD.title}
                </h3>
                <p className="mt-3 text-sm">{PRICING_DEMO_CARD.body}</p>
              </div>
              <a
                href={DEMO_URL}
                className="mt-6 flex min-h-13 items-center justify-center rounded-full bg-[color:var(--lv5-surface)] px-6 text-sm font-semibold text-[color:var(--lv5-ink)]"
              >
                {PRICING_DEMO_CARD.cta}
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
