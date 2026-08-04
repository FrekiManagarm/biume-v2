import { BOUNDARIES, BOUNDARIES_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Boundaries() {
  return (
    <section
      aria-labelledby="limites-title"
      className="relative bg-[color:var(--lv5-surface-muted)] px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <Reveal className="min-w-[280px] flex-1 basis-[300px]">
          <h2
            id="limites-title"
            className="max-w-[16ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {BOUNDARIES_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={90} className="min-w-[300px] flex-1 basis-[440px]">
          <ul className="flex flex-col">
            {BOUNDARIES.map((line, index) => (
              <li
                key={line}
                className={`border-t border-[color:var(--lv5-line)] py-[18px] text-[1.06rem] leading-[1.55] text-[color:var(--lv5-ink)] [text-wrap:pretty] ${
                  index === BOUNDARIES.length - 1 ? "border-b" : ""
                }`}
              >
                {line}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
