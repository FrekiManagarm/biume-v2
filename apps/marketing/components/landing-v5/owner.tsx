import {
  OWNER_EYEBROW,
  OWNER_LEAD,
  OWNER_MOCK_FOLLOWUP,
  OWNER_MOCK_LINK,
  OWNER_POINTS,
  OWNER_TITLE,
} from "./content";
import { Reveal } from "./motion";

export function LandingV5Owner() {
  return (
    <section
      id="proprietaire"
      aria-labelledby="proprietaire-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-[clamp(28px,5vw,72px)]">
        <div className="min-w-[290px] flex-1 basis-[400px]">
          <Reveal>
            <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-blue)]">
              {OWNER_EYEBROW}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2
              id="proprietaire-title"
              className="mt-[18px] max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {OWNER_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {OWNER_LEAD}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <ul className="mt-6 flex flex-col gap-[11px] text-[1rem] leading-[1.5]">
              {OWNER_POINTS.map((point) => (
                <li key={point} className="flex gap-[11px]">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] size-[7px] flex-none rounded-full bg-[color:var(--lv5-blue)]"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal
          delay={120}
          className="flex min-w-[280px] flex-1 basis-[340px] flex-wrap justify-center gap-[clamp(14px,2vw,20px)]"
        >
          <div className="w-full max-w-[216px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-2.5 pt-3 pb-4 shadow-[var(--lv5-shadow-manipulation)]">
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[color:var(--lv5-line)]" />
            <div className="rounded-[10px] bg-[color:var(--lv5-blue-soft)] p-3">
              <p className="text-[0.7rem] font-semibold text-[color:var(--lv5-blue-ink)]">
                {OWNER_MOCK_LINK.label}
              </p>
              <p className="mt-1.5 text-[0.84rem] leading-[1.45]">{OWNER_MOCK_LINK.message}</p>
            </div>
            <p className="mt-3.5 mb-2 text-[0.7rem] font-semibold text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_LINK.codeLabel}
            </p>
            <div className="flex gap-1.5">
              {OWNER_MOCK_LINK.digits.map((digit, index) => (
                <span
                  key={index}
                  className={`flex h-[34px] flex-1 items-center justify-center rounded-lg border text-[0.9rem] font-semibold ${
                    index === 2
                      ? "border-[color:var(--lv5-violet)]"
                      : digit
                        ? "border-[color:var(--lv5-line)]"
                        : "border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)]"
                  }`}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[216px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-4 shadow-[var(--lv5-shadow-manipulation)]">
            <p className="text-[0.7rem] font-semibold text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_FOLLOWUP.label}
            </p>
            <p className="mt-2 mb-3 text-[0.9rem] font-semibold leading-[1.35]">
              {OWNER_MOCK_FOLLOWUP.question}
            </p>
            <div className="flex flex-col gap-[7px]">
              {OWNER_MOCK_FOLLOWUP.answers.map((answer, index) => (
                <span
                  key={answer}
                  className={`rounded-[9px] border px-[11px] py-[9px] text-[0.8rem] ${
                    index === OWNER_MOCK_FOLLOWUP.selectedIndex
                      ? "border-[color:var(--lv5-green)] bg-[color:var(--lv5-green-soft)] font-semibold text-[color:var(--lv5-green-ink)]"
                      : "border-[color:var(--lv5-line)]"
                  }`}
                >
                  {answer}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[0.72rem] leading-[1.45] text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_FOLLOWUP.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
