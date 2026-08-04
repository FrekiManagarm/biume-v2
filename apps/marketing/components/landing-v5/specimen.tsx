"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import {
  SPECIMEN_EYEBROW,
  SPECIMEN_LEAD,
  SPECIMEN_NOTE,
  SPECIMEN_RAIL,
  SPECIMEN_STEPS,
  SPECIMEN_SUBJECT,
  SPECIMEN_TITLE,
} from "./content";
import { ensureGsapPlugins, Reveal } from "./motion";

export function LandingV5Specimen() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const track = trackRef.current;
      if (!track) return;

      const railItems = Array.from(
        track.querySelectorAll<HTMLElement>("[data-rail-item]"),
      );
      const panels = Array.from(track.querySelectorAll<HTMLElement>("[data-panel]"));
      const progressBar = track.querySelector<HTMLElement>("[data-demo-progress]");

      let current = -1;

      const setStep = (step: number) => {
        if (step === current) return;
        current = step;

        panels.forEach((panel) => {
          const index = Number(panel.getAttribute("data-panel"));
          const active = index === step;
          panel.style.display = active ? "flex" : "none";
          if (active) {
            // Reflow forcé : sans lui, réappliquer la même valeur
            // d'animation ne la relance pas.
            panel.style.animation = "none";
            void panel.offsetWidth;
            panel.style.animation =
              "biume-volet 420ms cubic-bezier(0.16,1,0.3,1) both";
          }
        });

        railItems.forEach((item) => {
          const index = Number(item.getAttribute("data-rail-item"));
          const active = index === step;
          item.style.backgroundColor = active ? "rgba(107,90,200,.22)" : "transparent";
          item.style.color = active ? "#FDFDFB" : "rgba(253,253,251,.45)";
          const dot = item.querySelector<HTMLElement>("[data-rail-dot]");
          if (dot) {
            dot.style.transform = active ? "scale(1.5)" : "scale(1)";
            dot.style.opacity = index <= step ? "1" : ".3";
          }
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.width = `${(self.progress * 100).toFixed(1)}%`;
          }
          setStep(Math.min(3, Math.floor(self.progress * 3.999)));
        },
      });

      setStep(0);

      return () => trigger.kill();
    },
    { scope: trackRef },
  );

  return (
    <section
      id="produit"
      aria-labelledby="demo-title"
      className="relative bg-[color:var(--lv5-anthracite)] text-[#FDFDFB]"
    >
      <div className="mx-auto max-w-[1200px] px-[clamp(18px,4vw,34px)] pt-[clamp(72px,9vw,116px)]">
        <Reveal>
          <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[#8E82E8]">
            {SPECIMEN_EYEBROW}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2
            id="demo-title"
            className="mt-[18px] max-w-[24ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em]"
          >
            {SPECIMEN_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-5 max-w-[52ch] text-[1.02rem] leading-[1.65] text-[#FDFDFB]/66 [text-wrap:pretty]">
            {SPECIMEN_LEAD}
          </p>
        </Reveal>
      </div>

      <div ref={trackRef} data-demo-track="" className="relative mt-[clamp(32px,4vw,54px)] h-[440vh]">
        <div className="sticky top-0 flex min-h-[100svh] items-center py-[88px] pb-[44px]">
          <div className="mx-auto w-full max-w-[1200px] px-[clamp(18px,4vw,34px)]">
            <div className="flex flex-wrap items-start gap-[clamp(20px,3vw,44px)]">
              <div className="w-full flex-none sm:w-[210px] flex flex-col gap-1">
                <p className="mb-2.5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.06em] text-[#FDFDFB]/42 uppercase">
                  {SPECIMEN_SUBJECT}
                </p>
                {SPECIMEN_RAIL.map((label, index) => (
                  <div
                    key={label}
                    data-rail-item={index}
                    className="flex items-center gap-[11px] rounded-[10px] px-[13px] py-[11px] transition-[background-color,color] duration-500"
                  >
                    <span
                      data-rail-dot=""
                      className="size-[7px] rounded-full bg-[color:var(--lv5-violet)] transition-transform duration-500"
                    />
                    <span className="text-[0.95rem] font-semibold">{label}</span>
                  </div>
                ))}
                <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-[#FDFDFB]/14">
                  <div
                    data-demo-progress=""
                    className="h-full w-0 bg-[color:var(--lv5-violet)] transition-[width] duration-[250ms] ease-linear"
                  />
                </div>
              </div>

              <div className="grid min-w-[280px] flex-1 basis-[460px] items-start">
                {SPECIMEN_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    data-panel={index}
                    className="col-start-1 row-start-1 flex flex-wrap gap-[clamp(14px,2vw,26px)]"
                    style={{ display: index === 0 ? "flex" : "none" }}
                  >
                    <div className="min-w-[220px] flex-1 basis-[240px] rounded-2xl border border-[#FDFDFB]/12 bg-[#FDFDFB]/5 p-5">
                      <p className="mb-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.08em] text-[#FDFDFB]/44 uppercase">
                        Vos notes
                      </p>
                      <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.86rem] leading-[1.7] text-[#FDFDFB]/82">
                        {step.raw}
                      </p>
                    </div>
                    <div className="min-w-[240px] flex-1 basis-[260px] rounded-2xl bg-[color:var(--lv5-surface)] p-[22px] text-[color:var(--lv5-ink)] shadow-[var(--lv5-shadow-focus)]">
                      <p className="mb-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                        Compte rendu propriétaire
                      </p>
                      <h3 className="mb-3 text-[1.16rem] font-semibold tracking-[-0.01em]">
                        {step.heading}
                      </h3>
                      <p className="mb-3.5 text-[1rem] leading-[1.62]">{step.out}</p>
                      <p className="text-[0.9rem] leading-[1.55] text-[color:var(--lv5-ink-soft)]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-[clamp(20px,3vw,34px)] max-w-[60ch] text-[0.8rem] leading-[1.5] text-[#FDFDFB]/44">
              {SPECIMEN_NOTE}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[clamp(56px,7vw,96px)]" />
    </section>
  );
}
