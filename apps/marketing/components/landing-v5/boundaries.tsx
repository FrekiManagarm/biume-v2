import { BOUNDARIES, BOUNDARIES_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Boundaries() {
  return (
    <section
      id="limites"
      aria-labelledby="boundaries-title"
      className="border-x-0 py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] border-x border-dashed border-[color:var(--lv5-line)]">
        <div className="px-[clamp(18px,4vw,34px)]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,16ch)_1fr]">
            <div>
              <h2
                id="boundaries-title"
                className="max-w-[16ch] text-[clamp(1.5rem,2.8vw,2.5rem)] font-[650] leading-[1.1] tracking-[-.02em] text-[color:var(--lv5-ink)]"
              >
                {BOUNDARIES_TITLE}
              </h2>
            </div>

            <div>
              {BOUNDARIES.map((line, i) => (
                <Reveal key={i} delay={i * 50}>
                  <p className="border-b border-[color:var(--lv5-line)] py-4 text-[0.94rem] leading-[1.6] text-[color:var(--lv5-ink-soft)] last:border-b-0">
                    {line}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
