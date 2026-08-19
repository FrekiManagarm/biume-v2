import {
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  HERO_LEAD,
  HERO_MOCK,
  HERO_PHONE_MOCK,
  HERO_PILL_BADGE,
  HERO_PILL_TEXT,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  TRIAL_NOTE,
} from "./content";
import { BrowserFrame } from "../frames/browser-frame";
import { PhoneFrame } from "../frames/phone-frame";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="lv5-grid-bg relative overflow-hidden pt-[calc(68px+clamp(44px,6vw,80px))] pb-[clamp(52px,7vw,96px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(64% 44% at 50% 0%, rgba(107,90,200,.16), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-[760px] px-[clamp(18px,4vw,34px)] text-center">
        <a
          href="#compte-rendu"
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lv5-line)] bg-[rgba(253,253,251,.9)] py-[5px] pl-[5px] pr-3.5 text-sm text-[color:var(--lv5-ink-mid)] shadow-[0_1px_2px_rgba(29,29,33,.05)]"
        >
          <span className="rounded-full bg-[color:var(--lv5-violet)] px-2.5 py-0.5 text-xs font-semibold text-white">
            {HERO_PILL_BADGE}
          </span>
          {HERO_PILL_TEXT}
          <span aria-hidden="true" className="text-[color:var(--lv5-violet)]">
            →
          </span>
        </a>

        <h1
          id="hero-title"
          className="mt-[clamp(20px,2.6vw,30px)] text-[clamp(2.7rem,6.6vw,5.2rem)] font-[650] leading-[.96] tracking-[-.045em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
        >
          {HERO_TITLE_LINE_1}
          <br />
          <span className="text-[color:var(--lv5-violet)]">{HERO_TITLE_LINE_2}</span>
        </h1>

        <p className="mx-auto mt-[clamp(18px,2.2vw,24px)] max-w-[54ch] text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
          {HERO_LEAD}
        </p>

        <div className="mt-[clamp(24px,3vw,34px)] flex flex-wrap items-center justify-center gap-3">
          <a
            href={webAppPath("/signup")}
            data-conversion="hero-signup"
            className="inline-flex h-[52px] items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-7 text-base font-semibold text-white shadow-[var(--lv5-shadow-cta)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
          >
            {HERO_CTA_PRIMARY}
          </a>
          <a
            href="#compte-rendu"
            className="inline-flex h-[52px] items-center justify-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-6 text-base font-semibold text-[color:var(--lv5-ink)] transition-colors hover:bg-[color:var(--lv5-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
          >
            {HERO_CTA_SECONDARY}
          </a>
        </div>

        <p className="mt-4 text-[.84rem] text-[color:var(--lv5-ink-tertiary)]">
          {TRIAL_NOTE}
        </p>
      </div>

      <Reveal
        delay={200}
        className="relative mx-auto mt-[clamp(34px,4.5vw,58px)] max-w-[1120px] px-[clamp(18px,4vw,34px)]"
      >
        <div
          aria-hidden="true"
          className="relative rounded-[24px]"
          style={{
            padding: "8px",
            background: "rgba(253,253,251,.6)",
            border: "1px solid var(--lv5-frame-border)",
            filter: "drop-shadow(0 26px 56px rgba(29,29,33,.18))",
          }}
        >
          <BrowserFrame urlLabel="app.biume.com/seances/nashira">
            <div className="flex text-left">
              <aside className="flex w-[172px] flex-shrink-0 flex-col gap-1 border-r border-[color:var(--lv5-frame-border)] bg-[color:var(--lv5-canvas)] p-3">
                {HERO_MOCK.nav.map((item) => {
                  const active = "active" in item && item.active;
                  const badge = "badge" in item ? item.badge : undefined;

                  return (
                    <span
                      key={item.label}
                      className={
                        active
                          ? "flex items-center justify-between gap-2 rounded-[9px] bg-[color:var(--lv5-violet-soft)] px-2.5 py-2 text-[0.82rem] font-semibold text-[color:var(--lv5-violet-ink)]"
                          : "flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-[0.82rem] text-[color:var(--lv5-ink-mid)]"
                      }
                    >
                      {item.label}
                      {badge ? (
                        <span className="rounded-full bg-[color:var(--lv5-violet)] px-[7px] py-px text-[0.68rem] text-white">
                          {badge}
                        </span>
                      ) : null}
                    </span>
                  );
                })}
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--lv5-frame-border)] px-[clamp(14px,2vw,22px)] py-3.5">
                  <div>
                    <p className="m-0 text-[1.02rem] font-semibold tracking-[-.015em] text-[color:var(--lv5-ink)]">
                      {HERO_MOCK.subject}
                    </p>
                    <p className="m-0 mt-1 text-[0.76rem] text-[color:var(--lv5-ink-tertiary)]">
                      {HERO_MOCK.subtitle}
                    </p>
                  </div>
                  <span className="inline-flex h-[34px] items-center rounded-full bg-[color:var(--lv5-violet)] px-4 text-[0.8rem] font-semibold text-white">
                    {HERO_MOCK.sendLabel}
                  </span>
                </div>

                <div className="flex flex-1 gap-[clamp(12px,1.6vw,18px)] p-[clamp(14px,2vw,22px)]">
                  <div
                    className="flex-1 rounded-[14px] p-[18px]"
                    style={{ background: "var(--lv5-anthracite)", color: "rgba(253,253,251,.86)" }}
                  >
                    <p
                      className="m-0 mb-3 text-[0.68rem] uppercase tracking-[.08em]"
                      style={{ fontFamily: "var(--lv5-font-mono)", color: "rgba(253,253,251,.42)" }}
                    >
                      {HERO_MOCK.rawLabel}
                    </p>
                    <p
                      className="m-0 text-[0.84rem] leading-[1.75]"
                      style={{ fontFamily: "var(--lv5-font-mono)" }}
                    >
                      {HERO_MOCK.raw}
                    </p>
                  </div>

                  <div className="flex-1 rounded-[14px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="m-0 text-[0.68rem] uppercase tracking-[.08em] text-[color:var(--lv5-ink-tertiary)]">
                        {HERO_MOCK.outLabel}
                      </p>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--lv5-green-soft)] px-2.5 py-1 text-[0.7rem] font-semibold text-[color:var(--lv5-green-ink)]">
                        <span className="size-1.5 rounded-full bg-[color:var(--lv5-green)]" />
                        {HERO_MOCK.outStatus}
                      </span>
                    </div>
                    {HERO_MOCK.out.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="m-0 mb-3 text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink)] last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[color:var(--lv5-frame-border)] bg-[color:var(--lv5-canvas)] px-[clamp(14px,2vw,22px)] py-3">
                  <span className="text-[0.76rem] text-[color:var(--lv5-ink-tertiary)]">
                    {HERO_MOCK.statusBarLeft}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[color:var(--lv5-green-ink)]">
                    <span className="size-1.5 rounded-full bg-[color:var(--lv5-green)]" />
                    {HERO_MOCK.statusBarRight}
                  </span>
                </div>
              </div>
            </div>
          </BrowserFrame>

          <PhoneFrame className="absolute -bottom-10 -right-6 w-[180px] max-[640px]:hidden animate-[biume-float_6s_ease-in-out_infinite]">
            <div className="flex h-full flex-col gap-2.5 p-3">
              <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                {HERO_PHONE_MOCK.label}
              </p>
              <div className="rounded-[10px] p-2.5" style={{ background: "var(--lv5-blue-soft)" }}>
                <p className="m-0 text-[0.68rem] font-semibold" style={{ color: "var(--lv5-blue-ink)" }}>
                  {HERO_PHONE_MOCK.linkLabel}
                </p>
              </div>
              <div className="rounded-[10px] border border-[color:var(--lv5-line)] p-2.5">
                <p className="m-0 text-[0.66rem] font-semibold text-[color:var(--lv5-ink-tertiary)]">
                  {HERO_PHONE_MOCK.followUpLabel}
                </p>
                <p className="m-0 mt-1 text-[0.76rem] leading-[1.4] text-[color:var(--lv5-ink)]">
                  {HERO_PHONE_MOCK.question}
                </p>
              </div>
              <div className="mt-auto flex min-h-[34px] items-center justify-center rounded-[10px] bg-[color:var(--lv5-violet)] text-[0.74rem] font-semibold text-white">
                {HERO_PHONE_MOCK.cta}
              </div>
            </div>
          </PhoneFrame>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[150px]"
          style={{ background: "linear-gradient(to bottom, transparent, var(--lv5-canvas) 74%)" }}
        />
      </Reveal>
    </section>
  );
}
