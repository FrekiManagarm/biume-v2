"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, useSyncExternalStore } from "react";

const desktopMediaQuery = "(min-width: 768px)";

function subscribeToDesktop(update: () => void) {
  const query = window.matchMedia(desktopMediaQuery);

  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}

function getDesktopSnapshot() {
  return window.matchMedia(desktopMediaQuery).matches;
}

function getServerDesktopSnapshot() {
  return false;
}

export type JourneyStep = {
  title: string;
  body: string;
};

type JourneyStoryProps = {
  steps: readonly JourneyStep[];
};

function JourneyMoment({
  step,
  index,
  progress,
  enhanced,
}: {
  step: JourneyStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
}) {
  const start = index / 4;
  const center = (index + 0.5) / 4;
  const end = (index + 1) / 4;
  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.08), center, Math.min(1, end + 0.08)],
    [0.42, 1, 0.58],
  );
  const y = useTransform(progress, [start, center, end], [22, 0, -10]);
  const scale = useTransform(progress, [start, center, end], [0.985, 1, 0.99]);

  return (
    <m.article
      data-journey-step={step.title}
      className="rounded-2xl border border-border bg-card p-6 text-card-foreground md:p-8"
      style={enhanced ? { opacity, y, scale } : undefined}
    >
      <h3 className="text-2xl font-semibold tracking-[-0.025em]">
        {step.title}
      </h3>
      <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted-foreground">
        {step.body}
      </p>
    </m.article>
  );
}

export function JourneyStory({ steps }: JourneyStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 45%"],
  });
  const enhanced = isDesktop && !reduceMotion;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={sectionRef}
        id="parcours"
        className="border-y border-border px-4 py-20 md:px-6 md:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              Un fil clair, du rendez-vous au prochain échange.
            </h2>
            <div className="mt-10 hidden h-40 w-px overflow-hidden bg-border md:block">
              <m.div
                data-journey-progress
                className="h-full w-full origin-top bg-primary"
                style={{ scaleY: enhanced ? scrollYProgress : 1 }}
              />
            </div>
          </div>

          <div className="grid gap-5 md:gap-[28vh] md:pb-[22vh]">
            {steps.map((step, index) => (
              <JourneyMoment
                key={step.title}
                step={step}
                index={index}
                progress={scrollYProgress}
                enhanced={enhanced}
              />
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
