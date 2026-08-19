import { FOLLOW_UP, FOLLOW_UP_EYEBROW, FOLLOW_UP_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5FollowUp() {
  return (
    <section
      id="suivi"
      aria-labelledby="follow-up-title"
      className="bg-[color:var(--lv5-blue-soft)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-blue-ink)]">
            {FOLLOW_UP_EYEBROW}
          </p>

          <h2
            id="follow-up-title"
            className="mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {FOLLOW_UP_TITLE}
          </h2>

          <div className="mt-[clamp(32px,4vw,48px)] grid grid-cols-1 gap-[clamp(16px,2.2vw,24px)] md:grid-cols-3">
            {FOLLOW_UP.map((step, index) => (
              <Reveal key={step.when} delay={index * 80}>
                <article className="rounded-[var(--lv5-radius-card)] bg-[color:var(--lv5-surface)] p-5">
                  <span className="inline-block rounded-md bg-[color:var(--lv5-blue-soft)] px-3 py-1 text-[0.82rem] font-[var(--lv5-font-mono)] text-[color:var(--lv5-blue-ink)]">
                    {step.when}
                  </span>
                  <h3 className="mt-4 text-[1.06rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.94rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                    {step.body}
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
