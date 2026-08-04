"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { FOLLOW_UP, FOLLOW_UP_EYEBROW, FOLLOW_UP_TITLE } from "./content";
import { ensureGsapPlugins, Reveal } from "./motion";

export function LandingV5FollowUp() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const host = hostRef.current;
      const fill = fillRef.current;
      if (!host || !fill) return;

      const trigger = ScrollTrigger.create({
        trigger: host,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          const rect = host.getBoundingClientRect();
          const vh = window.innerHeight;
          const progress = Math.max(
            0,
            Math.min(1, (vh * 0.78 - rect.top) / (rect.height * 0.86)),
          );
          fill.style.height = `${(progress * 100).toFixed(1)}%`;
        },
      });

      return () => trigger.kill();
    },
    { scope: hostRef },
  );

  return (
    <section
      id="suivi"
      aria-labelledby="suivi-title"
      className="relative bg-[color:var(--lv5-blue-soft)] px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-blue)]">
            {FOLLOW_UP_EYEBROW}
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2
            id="suivi-title"
            className="mt-[18px] max-w-[24ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {FOLLOW_UP_TITLE}
          </h2>
        </Reveal>

        <div
          ref={hostRef}
          className="relative mt-[clamp(38px,5vw,64px)] flex flex-col gap-[clamp(18px,2.4vw,28px)]"
        >
          <div
            aria-hidden="true"
            className="absolute top-3.5 bottom-3.5 left-[19px] w-0.5 overflow-hidden rounded-full bg-[color:var(--lv5-blue)]/24"
          >
            <div
              ref={fillRef}
              style={{ height: "0%" }}
              className="w-full bg-[color:var(--lv5-blue)] transition-[height] duration-[180ms] ease-linear"
            />
          </div>
          {FOLLOW_UP.map((milestone, index) => (
            <Reveal
              key={milestone.when}
              delay={index * 100}
              className="relative flex flex-wrap items-baseline gap-[clamp(16px,2.6vw,34px)] pl-[52px]"
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-3 size-4 rounded-full border-2 border-[color:var(--lv5-blue)] bg-[color:var(--lv5-blue-soft)]"
              />
              <span className="w-[60px] flex-none font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.9rem] font-semibold text-[color:var(--lv5-blue)]">
                {milestone.when}
              </span>
              <div className="min-w-[260px] flex-1 basis-[320px]">
                <h3 className="mb-2 text-[1.32rem] font-semibold tracking-[-0.01em] text-[color:var(--lv5-ink)]">
                  {milestone.title}
                </h3>
                <p className="text-[1rem] leading-[1.6] text-[color:var(--lv5-ink-mid)] [text-wrap:pretty]">
                  {milestone.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
