import type { ReactNode } from "react";

import { FEATURES, FEATURES_EYEBROW, FEATURES_TITLE } from "./content";
import { Reveal } from "./motion";

/**
 * Chrome de fenêtre légère (3 puces, sans barre d'url) pour les mocks de
 * cette section : contrairement au `BrowserFrame` du hero et de l'atelier,
 * ces panneaux sont trop étroits pour recevoir un contenu à échelle fixe
 * lisible — on reste sur des divs simples, comme le fait déjà `bento.tsx`.
 */
function PanelChrome({ children }: { children: ReactNode }) {
  return (
    <div className="w-[264px] shrink-0 overflow-hidden rounded-[14px] border border-(--lv5-frame-border) bg-(--lv5-canvas) shadow-[0_1px_2px_rgba(29,29,33,.05)]">
      <div className="flex items-center gap-1.5 border-b border-(--lv5-frame-border) px-3 py-2.5">
        <span className="size-2 rounded-full bg-(--lv5-line)" />
        <span className="size-2 rounded-full bg-(--lv5-line)" />
        <span className="size-2 rounded-full bg-(--lv5-line)" />
      </div>
      <div aria-hidden="true" className="flex min-h-[220px] flex-col gap-2.5 p-3">
        {children}
      </div>
    </div>
  );
}

export function LandingV5Features() {
  return (
    <section
      id="fonctions"
      aria-labelledby="features-title"
      className="border-x-0 py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] border-x border-dashed border-[color:var(--lv5-line)]">
        <div className="px-[clamp(18px,4vw,34px)] text-center">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
            {FEATURES_EYEBROW}
          </p>

          <h2
            id="features-title"
            className="mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {FEATURES_TITLE}
          </h2>

          <div className="mt-[clamp(32px,4vw,48px)] flex flex-col gap-[clamp(16px,2.2vw,24px)] text-left">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.n} delay={i * 100}>
                <article
                  className={`flex flex-wrap items-center gap-[clamp(24px,4vw,48px)] rounded-[var(--lv5-radius-block)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)] md:flex-nowrap ${
                    i === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[color:var(--lv5-violet-soft)] text-[0.82rem] font-semibold text-[color:var(--lv5-violet-ink)]">
                      {feature.n}
                    </span>
                    <h3 className="mt-4 text-[clamp(1.5rem,2.4vw,2.1rem)] font-[650] leading-[1.1] tracking-[-.03em] text-[color:var(--lv5-ink)]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 max-w-[46ch] text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                      {feature.body}
                    </p>
                    <a
                      href="#produit"
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.94rem] font-semibold text-[color:var(--lv5-violet)]"
                    >
                      {feature.link}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>

                  <PanelChrome>
                    {"panelLabel" in feature ? (
                      <>
                        <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                          {feature.panelLabel}
                        </p>
                        <div
                          className="rounded-[10px] p-2.5 font-[family-name:var(--lv5-font-mono)] text-[0.72rem] leading-[1.5]"
                          style={{ background: "var(--lv5-anthracite)", color: "rgba(253,253,251,.86)" }}
                        >
                          {feature.panelRaw}
                        </div>
                        <div className="mt-auto flex min-h-[34px] items-center justify-center rounded-[10px] bg-[color:var(--lv5-violet)] text-[0.74rem] font-semibold text-white">
                          {feature.panelCta}
                        </div>
                      </>
                    ) : null}

                    {"panelStates" in feature ? (
                      <>
                        <ul className="flex flex-col gap-1.5">
                          {feature.panelStates.map((state) => (
                            <li key={state} className="flex items-center gap-2">
                              <span
                                aria-hidden="true"
                                className={`size-1.5 shrink-0 rounded-full ${
                                  state.includes("Validé")
                                    ? "bg-[color:var(--lv5-green)]"
                                    : "bg-[color:var(--lv5-violet)]"
                                }`}
                              />
                              <span className="text-[0.72rem] text-[color:var(--lv5-ink)]">{state}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="m-0 rounded-[10px] border border-[color:var(--lv5-line)] p-2.5 text-[0.74rem] leading-[1.5] text-[color:var(--lv5-ink)]">
                          {feature.panelExtract}
                        </p>
                        <div className="mt-auto flex gap-2">
                          {feature.panelActions.map((action, actionIndex) => (
                            <span
                              key={action}
                              className={`flex min-h-[34px] flex-1 items-center justify-center rounded-[10px] text-[0.72rem] font-semibold ${
                                actionIndex === feature.panelActions.length - 1
                                  ? "bg-[color:var(--lv5-violet)] text-white"
                                  : "border border-[color:var(--lv5-line)] text-[color:var(--lv5-ink)]"
                              }`}
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : null}

                    {"panelStatus" in feature ? (
                      <>
                        <div className="rounded-[10px] p-2.5" style={{ background: "var(--lv5-green-soft)" }}>
                          <p className="m-0 text-[0.72rem] font-semibold" style={{ color: "var(--lv5-green-ink)" }}>
                            {feature.panelStatus}
                          </p>
                        </div>
                        <div className="rounded-[10px] border border-[color:var(--lv5-line)] p-2.5">
                          <p className="m-0 text-[0.7rem] leading-[1.4] text-[color:var(--lv5-ink)]">
                            {feature.panelFollowUp}
                          </p>
                        </div>
                        <div className="mt-auto rounded-[10px] border border-[color:var(--lv5-line)] p-2.5 text-[0.7rem] text-[color:var(--lv5-ink-tertiary)]">
                          {feature.panelControl}
                        </div>
                      </>
                    ) : null}
                  </PanelChrome>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
