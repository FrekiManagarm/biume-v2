import { SURFACES_LEAD, SURFACES_MOBILE, SURFACES_TITLE, SURFACES_WEB } from "./content";
import { Reveal } from "./motion";

export function LandingV5Surfaces() {
  return (
    <section
      aria-labelledby="surfaces-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="surfaces-title"
              className="max-w-[20ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {SURFACES_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[36ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {SURFACES_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap items-stretch gap-[clamp(20px,3vw,40px)]">
          <Reveal className="flex min-w-[280px] flex-1 basis-[300px] flex-col gap-[22px] rounded-[24px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,2.6vw,32px)]">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--lv5-violet-soft)] px-[11px] py-[5px] text-[0.72rem] font-semibold text-[color:var(--lv5-violet-ink)]">
                {SURFACES_MOBILE.chip}
              </span>
              <span className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">
                {SURFACES_MOBILE.precision}
              </span>
            </div>
            <div className="mx-auto w-full max-w-[232px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)] px-2.5 pt-3 pb-4 shadow-[var(--lv5-shadow-manipulation)]">
              <div className="mx-auto mb-3 h-1 w-[52px] rounded-full bg-[color:var(--lv5-line)]" />
              <div className="flex flex-col gap-[9px]">
                {SURFACES_MOBILE.cards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-[10px] p-[11px] ${
                      card.tone === "violet"
                        ? "bg-[color:var(--lv5-violet-soft)]"
                        : card.tone === "green"
                          ? "flex items-center justify-between bg-[color:var(--lv5-green-soft)]"
                          : "border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-[0.7rem] font-semibold ${
                          card.tone === "violet"
                            ? "text-[color:var(--lv5-violet-ink)]"
                            : card.tone === "green"
                              ? "text-[color:var(--lv5-green-ink)]"
                              : "text-[color:var(--lv5-ink-soft)]"
                        }`}
                      >
                        {card.label}
                      </p>
                      {card.value ? (
                        <p className="mt-[5px] text-[0.84rem] font-semibold leading-[1.4]">
                          {card.value}
                        </p>
                      ) : null}
                    </div>
                    {card.tone === "green" ? (
                      <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--lv5-green)]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <ul className="flex flex-col gap-[9px] text-[0.96rem] leading-[1.5] text-[color:var(--lv5-ink-mid)]">
              {SURFACES_MOBILE.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={120}
            className="flex min-w-[300px] flex-1 basis-[380px] flex-col gap-[22px] rounded-[24px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,2.6vw,32px)]"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--lv5-blue-soft)] px-[11px] py-[5px] text-[0.72rem] font-semibold text-[color:var(--lv5-blue-ink)]">
                {SURFACES_WEB.chip}
              </span>
              <span className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">
                {SURFACES_WEB.precision}
              </span>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)] shadow-[var(--lv5-shadow-manipulation)]">
              <div className="flex items-center gap-1.5 border-b border-[color:var(--lv5-line)] px-3 py-2.5">
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="ml-2 text-[0.72rem] text-[color:var(--lv5-ink-soft)]">
                  {SURFACES_WEB.windowTitle}
                </span>
              </div>
              <div className="flex gap-3 p-3.5">
                <div className="flex w-24 flex-none flex-col gap-[7px]">
                  <div className="h-[9px] w-[70%] rounded-[3px] bg-[color:var(--lv5-violet)]" />
                  <div className="h-[9px] rounded-[3px] bg-[color:var(--lv5-line)]" />
                  <div className="h-[9px] w-[80%] rounded-[3px] bg-[color:var(--lv5-line)]" />
                  <div className="h-[9px] w-[60%] rounded-[3px] bg-[color:var(--lv5-line)]" />
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-lg border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-3">
                  <div className="h-2 w-[92%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[78%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[54%] rounded-[3px] bg-[color:var(--lv5-violet-soft)]" />
                  <div className="h-2 w-[86%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[42%] rounded-[3px] bg-[color:var(--lv5-green-soft)]" />
                </div>
              </div>
            </div>
            <ul className="flex flex-col gap-[9px] text-[0.96rem] leading-[1.5] text-[color:var(--lv5-ink-mid)]">
              {SURFACES_WEB.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
