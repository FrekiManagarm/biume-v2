import { FACTS, FACTS_LEAD, FACTS_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Facts() {
  return (
    <section
      aria-labelledby="constat-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="constat-title"
              className="max-w-[20ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {FACTS_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[38ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {FACTS_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap gap-[clamp(18px,2.4vw,30px)]">
          {FACTS.map((fact, index) => (
            <Reveal
              key={fact.n}
              delay={60 + index * 90}
              className="min-w-[250px] flex-1 basis-[260px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-6 pt-[26px] pb-7"
            >
              <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-violet)]">
                {fact.n}
              </span>
              <h3 className="mt-3.5 mb-2.5 text-[1.3rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[color:var(--lv5-ink)]">
                {fact.title}
              </h3>
              <p className="text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
                {fact.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
