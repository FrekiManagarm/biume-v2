import { FACTS, FACTS_EYEBROW, FACTS_LEAD, FACTS_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Facts() {
  return (
    <section
      id="constat"
      aria-labelledby="facts-title"
      className="border-x-0 py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] border-x border-dashed border-[color:var(--lv5-line)]">
        <div className="px-[clamp(18px,4vw,34px)] text-center">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
            {FACTS_EYEBROW}
          </p>

          <h2
            id="facts-title"
            className="mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {FACTS_TITLE}
          </h2>

          <p className="mx-auto mt-4 max-w-[54ch] text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
            {FACTS_LEAD}
          </p>

          <div className="mt-[clamp(32px,4vw,48px)] grid grid-cols-1 gap-[clamp(16px,2.2vw,24px)] text-left md:grid-cols-3">
            {FACTS.map((fact, index) => (
              <Reveal key={fact.n} delay={index * 80}>
                <article className="h-full rounded-[17px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-6 transition-shadow hover:shadow-[var(--lv5-shadow-hover)]">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[color:var(--lv5-violet-soft)] text-[0.82rem] font-semibold text-[color:var(--lv5-violet-ink)]">
                    {fact.n}
                  </span>
                  <h3 className="mt-4 text-[1.06rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                    {fact.title}
                  </h3>
                  <p className="mt-2 text-[0.94rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                    {fact.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
