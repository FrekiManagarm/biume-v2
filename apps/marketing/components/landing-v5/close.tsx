import Link from "next/link";

import { CLOSE_LEAD, CLOSE_TITLE, HERO_CTA_PRIMARY, TRIAL_NOTE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Close() {
  return (
    <section
      aria-labelledby="cloture-title"
      className="relative overflow-hidden bg-[color:var(--lv5-anthracite)] px-[clamp(18px,4vw,34px)] py-[clamp(84px,11vw,152px)] text-[#FDFDFB]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(58% 62% at 22% 84%, rgba(107,90,200,.5) 0%, transparent 66%), radial-gradient(48% 54% at 88% 12%, rgba(93,155,184,.28) 0%, transparent 62%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-[clamp(26px,4vw,60px)]">
        <div>
          <Reveal>
            <h2
              id="cloture-title"
              className="max-w-[20ch] text-[clamp(2.2rem,5vw,4.4rem)] font-[650] leading-[.98] tracking-[-0.035em]"
            >
              {CLOSE_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-[22px] max-w-[44ch] text-[1.06rem] leading-[1.6] text-[#FDFDFB]/70 [text-wrap:pretty]">
              {CLOSE_LEAD}
            </p>
          </Reveal>
        </div>
        <Reveal delay={170} className="flex flex-col gap-3">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="close-signup"
            className="min-h-11 inline-flex items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-7 text-[0.98rem] font-semibold text-white"
          >
            {HERO_CTA_PRIMARY}
          </Link>
          <span className="text-[0.84rem] text-[#FDFDFB]/60">{TRIAL_NOTE}</span>
        </Reveal>
      </div>
    </section>
  );
}
