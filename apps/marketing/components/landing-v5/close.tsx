import {
  CLOSE_CTA_PRIMARY,
  CLOSE_CTA_SECONDARY,
  CLOSE_LEAD,
  CLOSE_TITLE,
  DEMO_URL,
  TRIAL_NOTE,
} from "./content";
import { webAppPath } from "../../lib/web-app-url";

export function LandingV5Close() {
  return (
    <section
      id="cloture"
      aria-labelledby="close-title"
      className="lv5-grid-bg-dark relative overflow-hidden bg-[color:var(--lv5-anthracite)] py-[clamp(68px,9vw,132px)] px-[clamp(18px,4vw,34px)] text-center text-[color:var(--lv5-surface)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50% 50% at 0% 100%, rgba(107,90,200,.45), transparent 70%), radial-gradient(45% 45% at 100% 0%, rgba(93,155,184,.26), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[720px]">
        <h2
          id="close-title"
          className="text-[clamp(2.2rem,5vw,4.2rem)] font-[650] leading-[.98] tracking-[-.045em] [text-wrap:balance]"
        >
          {CLOSE_TITLE}
        </h2>
        <p className="mx-auto mt-4 max-w-[54ch] text-[rgba(253,253,251,.72)]">{CLOSE_LEAD}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={webAppPath("/signup")}
            data-conversion="close-signup"
            className="inline-flex min-h-13 items-center rounded-full bg-[color:var(--lv5-violet)] px-6 text-[0.95rem] font-semibold text-white shadow-[var(--lv5-shadow-cta)] transition-opacity hover:opacity-92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
          >
            {CLOSE_CTA_PRIMARY}
          </a>
          <a
            href={DEMO_URL}
            className="inline-flex min-h-13 items-center rounded-full border border-[rgba(253,253,251,.3)] px-6 text-[0.95rem] font-semibold text-[color:var(--lv5-surface)] transition-colors hover:bg-[rgba(253,253,251,.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-surface)]"
          >
            {CLOSE_CTA_SECONDARY}
          </a>
        </div>

        <p className="mt-6 text-[0.82rem] text-[rgba(253,253,251,.44)]">{TRIAL_NOTE}</p>
      </div>
    </section>
  );
}
