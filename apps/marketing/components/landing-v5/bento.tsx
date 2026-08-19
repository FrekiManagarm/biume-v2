import {
  BENTO_EYEBROW,
  BENTO_FOLLOW_UP,
  BENTO_NOTES_TO_DOC,
  BENTO_OWNER,
  BENTO_TITLE,
  BENTO_VALIDATION,
} from "./content";
import { Reveal } from "./motion";

const TONE_DOT: Record<string, string> = {
  green: "bg-[color:var(--lv5-green)]",
  violet: "bg-[color:var(--lv5-violet)]",
};

export function LandingV5Bento() {
  return (
    <section
      id="solution"
      aria-labelledby="bento-title"
      className="border-x-0 py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] border-x border-dashed border-[color:var(--lv5-line)]">
        <div className="px-[clamp(18px,4vw,34px)] text-center">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
            {BENTO_EYEBROW}
          </p>

          <h2
            id="bento-title"
            className="mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {BENTO_TITLE}
          </h2>

          <div className="mt-[clamp(32px,4vw,48px)] grid grid-cols-1 gap-[clamp(16px,2.2vw,24px)] text-left sm:grid-cols-2">
            <Reveal
              delay={0}
              className="sm:col-span-2 rounded-[var(--lv5-radius-major)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]"
            >
              <h3 className="text-[1.06rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                {BENTO_NOTES_TO_DOC.title}
              </h3>
              <div className="mt-5 flex flex-col items-start gap-3">
                <span className="rounded-lg bg-[color:var(--lv5-anthracite)] px-3 py-2 font-[family-name:var(--lv5-font-mono)] text-[0.82rem] text-[rgba(253,253,251,.92)]">
                  <span className="mr-2 text-[0.72rem] uppercase tracking-[.04em] text-[rgba(253,253,251,.56)]">
                    {BENTO_NOTES_TO_DOC.rawLabel}
                  </span>
                  {BENTO_NOTES_TO_DOC.raw}
                </span>
                <span aria-hidden="true" className="text-[1.1rem] text-[color:var(--lv5-violet)]">
                  ↓
                </span>
                <span className="rounded-lg border border-[color:var(--lv5-line)] px-3 py-2 text-[0.9rem] leading-[1.5] text-[color:var(--lv5-ink)]">
                  <span className="mr-2 text-[0.72rem] uppercase tracking-[.04em] text-[color:var(--lv5-ink-tertiary)]">
                    {BENTO_NOTES_TO_DOC.outLabel}
                  </span>
                  {BENTO_NOTES_TO_DOC.out}
                </span>
              </div>
            </Reveal>

            <Reveal
              delay={60}
              className="rounded-[var(--lv5-radius-major)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]"
            >
              <h3 className="text-[1.06rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                {BENTO_VALIDATION.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {BENTO_VALIDATION.rows.map((row) => (
                  <li key={row.label} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 shrink-0 rounded-full ${TONE_DOT[row.tone] ?? TONE_DOT.green}`}
                    />
                    <span className="text-[0.92rem] text-[color:var(--lv5-ink)]">
                      {row.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal
              delay={120}
              className="rounded-[var(--lv5-radius-major)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]"
            >
              <h3 className="text-[1.06rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                {BENTO_OWNER.title}
              </h3>
              <div className="mt-5 inline-flex rounded-lg bg-[color:var(--lv5-blue-soft)] px-3 py-2 text-sm text-[color:var(--lv5-blue-ink)]">
                {BENTO_OWNER.card}
              </div>
            </Reveal>

            <Reveal
              delay={180}
              className="sm:col-span-2 rounded-[var(--lv5-radius-major)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-anthracite)] p-[clamp(22px,4vw,32px)] text-[rgba(253,253,251,.82)]"
            >
              <h3 className="text-[1.06rem] font-semibold tracking-[-.01em] text-white">
                {BENTO_FOLLOW_UP.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {BENTO_FOLLOW_UP.rows.map((row) => (
                  <li key={row.when} className="flex items-center gap-3">
                    <span className="rounded-full bg-[rgba(253,253,251,.08)] px-2.5 py-1 font-[family-name:var(--lv5-font-mono)] text-[0.72rem] uppercase tracking-[.04em]">
                      {row.when}
                    </span>
                    <span className="text-[0.92rem]">{row.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
