"use client";

import { useState } from "react";

import {
  CONTROL_EYEBROW,
  CONTROL_INVITE,
  CONTROL_LEAD,
  CONTROL_PASSAGES,
  CONTROL_TITLE,
} from "./content";
import { Reveal } from "./motion";

export function LandingV5Control() {
  const [validated, setValidated] = useState<boolean[]>(() =>
    CONTROL_PASSAGES.map(() => false),
  );
  const remaining = validated.filter((value) => !value).length;
  const allValidated = remaining === 0;

  const toggle = (index: number) => {
    setValidated((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <section
      id="controle"
      aria-labelledby="controle-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <div className="min-w-[290px] flex-1 basis-[340px] lg:sticky lg:top-[110px]">
          <Reveal>
            <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-violet)]">
              {CONTROL_EYEBROW}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2
              id="controle-title"
              className="mt-[18px] max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {CONTROL_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {CONTROL_LEAD}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-[22px] text-[0.86rem] font-semibold text-[color:var(--lv5-violet)]">
              {CONTROL_INVITE}
            </p>
          </Reveal>
        </div>

        <Reveal className="min-w-[300px] flex-1 basis-[420px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(18px,2.4vw,28px)]">
          {CONTROL_PASSAGES.map((passage, index) => {
            const isValidated = validated[index];
            return (
              <button
                key={passage.id}
                type="button"
                onClick={() => toggle(index)}
                data-control-passage={passage.id}
                data-state={isValidated ? "valide" : "attente"}
                className={`min-h-11 mt-3 block w-full rounded-[10px] border p-4 text-left transition-[border-color,background-color] duration-[400ms] first:mt-0 ${
                  isValidated
                    ? "border-[color:var(--lv5-green)] bg-[color:var(--lv5-green-soft)]"
                    : "border-[color:var(--lv5-line)] bg-transparent"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.7rem] font-semibold tracking-[0.06em] text-[color:var(--lv5-ink-soft)] uppercase">
                    {passage.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-[11px] py-[5px] text-[0.72rem] font-semibold transition-colors duration-[400ms] ${
                      isValidated
                        ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-green-ink)]"
                        : "bg-[color:var(--lv5-surface-muted)] text-[color:var(--lv5-ink-soft)]"
                    }`}
                  >
                    {isValidated ? "Validé" : "En attente"}
                  </span>
                </span>
                <span className="mt-[11px] block text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink)]">
                  {passage.text}
                </span>
              </button>
            );
          })}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--lv5-line)] pt-[18px]">
            <span
              className={`text-[0.84rem] ${
                allValidated ? "text-[color:var(--lv5-green-ink)]" : "text-[color:var(--lv5-ink-soft)]"
              }`}
            >
              {allValidated
                ? "Les trois passages sont validés."
                : `${remaining} ${remaining === 1 ? "passage attend" : "passages attendent"} votre relecture.`}
            </span>
            <button
              type="button"
              disabled={!allValidated}
              className={`min-h-11 inline-flex items-center rounded-full px-[22px] text-[0.92rem] font-semibold transition-[background-color,color,box-shadow] duration-[450ms] ${
                allValidated
                  ? "bg-[color:var(--lv5-violet)] text-white shadow-[var(--lv5-shadow-focus)]"
                  : "cursor-default bg-[color:var(--lv5-surface-muted)] text-[color:var(--lv5-ink-soft)]"
              }`}
            >
              Envoyer au propriétaire
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
