import {
  OWNER_EYEBROW,
  OWNER_LEAD,
  OWNER_MOCK_FOLLOWUP,
  OWNER_MOCK_LINK,
  OWNER_POINTS,
  OWNER_TITLE,
} from "./content";
import { PhoneFrame } from "../frames/phone-frame";
import { Reveal } from "./motion";

export function LandingV5Owner() {
  return (
    <section
      id="proprietaire"
      aria-labelledby="owner-title"
      className="py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-[clamp(28px,5vw,68px)] md:grid-cols-2">
        <div>
          <span className="inline-flex w-fit items-center rounded-full bg-[color:var(--lv5-blue-soft)] px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-blue-ink)]">
            {OWNER_EYEBROW}
          </span>

          <h2
            id="owner-title"
            className="mt-4 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {OWNER_TITLE}
          </h2>

          <p className="mt-4 max-w-[46ch] text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
            {OWNER_LEAD}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {OWNER_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--lv5-blue)]"
                />
                <span className="text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={150}>
          <div className="flex gap-4">
            <PhoneFrame className="min-w-0 flex-1">
              <div aria-hidden="true" className="flex h-full flex-col gap-2 pt-9 px-[13px] pb-4">
                <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                  {OWNER_MOCK_LINK.label}
                </p>
                <p className="m-0 text-[0.78rem] leading-[1.4] text-[color:var(--lv5-ink)]">
                  {OWNER_MOCK_LINK.message}
                </p>
                <p className="mt-2 m-0 text-[0.66rem] uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                  {OWNER_MOCK_LINK.codeLabel}
                </p>
                <div className="flex gap-2">
                  {OWNER_MOCK_LINK.digits.map((digit, index) => (
                    <div
                      key={index}
                      className={`flex size-8 items-center justify-center rounded-[8px] text-[0.82rem] font-semibold text-[color:var(--lv5-ink)] ${
                        index === 2
                          ? "border-2 border-[color:var(--lv5-violet)]"
                          : "border border-[color:var(--lv5-line)]"
                      }`}
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-center min-h-[34px] rounded-[10px] bg-[color:var(--lv5-blue)] text-[0.78rem] font-semibold text-white">
                  {OWNER_MOCK_LINK.cta}
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame className="min-w-0 flex-1">
              <div aria-hidden="true" className="flex h-full flex-col gap-2 pt-9 px-[13px] pb-4">
                <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                  {OWNER_MOCK_FOLLOWUP.label}
                </p>
                <p className="m-0 text-[0.82rem] font-semibold leading-[1.4] text-[color:var(--lv5-ink)]">
                  {OWNER_MOCK_FOLLOWUP.question}
                </p>
                <div className="flex flex-col gap-1.5">
                  {OWNER_MOCK_FOLLOWUP.answers.map((answer, index) => (
                    <div
                      key={answer}
                      className={`flex items-center gap-1.5 rounded-[8px] px-2.5 py-2 text-[0.74rem] ${
                        index === OWNER_MOCK_FOLLOWUP.selectedIndex
                          ? "bg-[color:var(--lv5-green-soft)] font-semibold text-[color:var(--lv5-green-ink)]"
                          : "border border-[color:var(--lv5-line)] text-[color:var(--lv5-ink)]"
                      }`}
                    >
                      {index === OWNER_MOCK_FOLLOWUP.selectedIndex ? (
                        <span aria-hidden="true">✓</span>
                      ) : null}
                      {answer}
                    </div>
                  ))}
                </div>
                <p className="mt-auto m-0 text-[0.68rem] leading-[1.4] text-[color:var(--lv5-ink-tertiary)]">
                  {OWNER_MOCK_FOLLOWUP.note}
                </p>
              </div>
            </PhoneFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
