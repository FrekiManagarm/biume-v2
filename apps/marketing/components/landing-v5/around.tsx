import { AROUND_ITEMS, AROUND_LEAD, AROUND_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Around() {
  return (
    <section
      aria-labelledby="around-title"
      className="relative px-[clamp(18px,4vw,34px)] pb-[clamp(72px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1200px] border-t border-[color:var(--lv5-line)] pt-[clamp(30px,4vw,52px)]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <Reveal>
            <h2
              id="around-title"
              className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)]"
            >
              {AROUND_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="max-w-[34ch] text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
              {AROUND_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(24px,3vw,36px)] flex flex-wrap gap-[clamp(14px,2vw,22px)]">
          {AROUND_ITEMS.map((item, index) => (
            <Reveal
              key={item.title}
              delay={40 + index * 70}
              className="min-w-[200px] flex-1 basis-[210px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-5"
            >
              <h3 className="mb-2 text-[1.06rem] font-semibold text-[color:var(--lv5-ink)]">
                {item.title}
              </h3>
              <p className="text-[0.92rem] leading-[1.55] text-[color:var(--lv5-ink-soft)]">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
