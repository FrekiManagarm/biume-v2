import Image from "next/image";
import Link from "next/link";

import { HERO_CARD, HERO_CTA_PRIMARY, HERO_CTA_SECONDARY, HERO_LEAD, HERO_PILL, HERO_TITLE, TRIAL_NOTE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Parallax, Reveal } from "./motion";

export function LandingV5Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Parallax factor={0.28} className="absolute -top-[8%] -bottom-[8%] inset-x-0">
          <div className="relative h-full w-full">
            <Image
              src="/assets/images/landing/atelier-hero.webp"
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-[64%_50%]"
            />
          </div>
        </Parallax>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(72% 58% at 18% 78%, rgba(107,90,200,.46) 0%, transparent 62%), radial-gradient(60% 52% at 82% 16%, rgba(46,152,102,.28) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(247,247,244,.72) 0%, rgba(247,247,244,.32) 26%, rgba(247,247,244,.30) 52%, rgba(247,247,244,.86) 84%, #F7F7F4 100%)",
          }}
        />
        {/* Voile latéral requis pour l'accessibilité : sans lui, l'encre
            --lv5-ink de l'accroche passe sous 4.5:1 là où l'écurie sombre
            de la photo traverse la colonne de texte. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(247,247,244,.93) 0%, rgba(247,247,244,.86) 32%, rgba(247,247,244,.5) 54%, rgba(247,247,244,0) 82%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-[clamp(18px,4vw,34px)] py-[120px] pb-[104px]">
        <div className="flex flex-wrap items-center gap-[clamp(30px,4vw,60px)]">
          <div className="min-w-[290px] flex-1 basis-[460px]">
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/82 px-[14px] py-[7px] pl-3 text-[0.78rem] font-semibold text-[color:var(--lv5-ink)] backdrop-blur-[6px]">
              <span
                aria-hidden="true"
                className="size-[7px] animate-[biume-pulse_2.6s_ease-in-out_infinite] rounded-full bg-[color:var(--lv5-violet)]"
              />
              {HERO_PILL}
            </Reveal>

            <Reveal delay={90}>
              <h1
                id="hero-title"
                className="mt-[22px] max-w-[19ch] text-[clamp(2.7rem,6.2vw,5.4rem)] font-[650] leading-[.94] tracking-[-0.035em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
              >
                {HERO_TITLE}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-[26px] max-w-[56ch] text-[clamp(1.02rem,1.35vw,1.2rem)] leading-[1.6] text-[color:var(--lv5-ink)] [text-wrap:pretty]">
                {HERO_LEAD}
              </p>
            </Reveal>

            <Reveal delay={270} className="mt-[34px] flex flex-wrap gap-3">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="hero-signup"
                className="min-h-11 inline-flex items-center rounded-full bg-[color:var(--lv5-violet)] px-[26px] text-[0.98rem] font-semibold text-white shadow-[var(--lv5-shadow-focus)]"
              >
                {HERO_CTA_PRIMARY}
              </Link>
              <a
                href="#produit"
                className="min-h-11 inline-flex items-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/90 px-[26px] text-[0.98rem] font-semibold text-[color:var(--lv5-ink)] backdrop-blur-[6px]"
              >
                {HERO_CTA_SECONDARY}
              </a>
            </Reveal>

            <Reveal delay={340}>
              <p className="mt-5 text-[0.84rem] font-semibold text-[color:var(--lv5-ink)]">
                {TRIAL_NOTE}
              </p>
            </Reveal>
          </div>

          <Reveal
            delay={220}
            className="min-w-[290px] max-w-[520px] flex-1 basis-[380px] rounded-[24px] border border-white/60 bg-[color:var(--lv5-surface)]/72 p-[clamp(16px,1.8vw,22px)] backdrop-blur-[14px] shadow-[var(--lv5-shadow-focus)]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] font-semibold tracking-[0.06em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.subject}
              </span>
              <span className="rounded-full bg-[color:var(--lv5-green-soft)] px-[10px] py-[5px] text-[0.7rem] font-semibold text-[color:var(--lv5-green-ink)]">
                {HERO_CARD.status}
              </span>
            </div>
            <div className="rounded-[10px] bg-[color:var(--lv5-surface-muted)] px-[14px] py-[13px]">
              <p className="mb-[7px] font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.64rem] font-semibold tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.rawLabel}
              </p>
              <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.8rem] leading-[1.6] text-[color:var(--lv5-ink-mid)]">
                {HERO_CARD.raw}
              </p>
            </div>
            <div aria-hidden="true" className="flex items-center gap-2.5 px-0.5 py-2.5">
              <span className="h-px flex-1 bg-[color:var(--lv5-line)]" />
              <span className="text-[0.78rem] font-semibold text-[color:var(--lv5-violet)]">
                {HERO_CARD.divider}
              </span>
              <span className="h-px flex-1 bg-[color:var(--lv5-line)]" />
            </div>
            <div className="rounded-xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-4">
              <p className="mb-2 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.64rem] font-semibold tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.outLabel}
              </p>
              {HERO_CARD.out.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`text-[0.96rem] leading-[1.6] ${index === 0 ? "mb-2.5" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 animate-[biume-cue_2.8s_ease-in-out_infinite] flex-col items-center gap-[7px] text-[0.66rem] font-semibold tracking-[0.14em] text-[color:var(--lv5-ink-soft)] uppercase"
      >
        <span>Faites défiler</span>
        <span
          className="h-[26px] w-px"
          style={{ backgroundImage: "linear-gradient(180deg,#696970,transparent)" }}
        />
      </div>
    </section>
  );
}
