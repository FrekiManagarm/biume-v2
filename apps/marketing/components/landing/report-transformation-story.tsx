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

import type {
  ReportTransformationDemo,
  ReportTransformationStep,
} from "./report-transformation-demo";

const desktopMediaQuery = "(min-width: 768px)";

const stepRanges: Array<{
  input: number[];
  opacity: number[];
  y: number[];
}> = [
  { input: [0, 0.08, 0.28], opacity: [1, 1, 0.54], y: [0, 0, -8] },
  { input: [0.12, 0.34, 0.54], opacity: [0.54, 1, 0.54], y: [12, 0, -8] },
  { input: [0.4, 0.66, 0.84], opacity: [0.54, 1, 0.54], y: [12, 0, -8] },
  { input: [0.7, 0.92, 1], opacity: [0.54, 1, 1], y: [12, 0, 0] },
];

const layerRanges: Array<{
  input: number[];
  opacity: number[];
  y: number[];
}> = [
  { input: [0, 0.18, 0.3], opacity: [1, 1, 0], y: [0, 0, -10] },
  { input: [0.18, 0.34, 0.5], opacity: [0, 1, 0], y: [10, 0, -10] },
  { input: [0.44, 0.66, 0.8], opacity: [0, 1, 0], y: [10, 0, -10] },
  { input: [0.72, 0.9, 1], opacity: [0, 1, 1], y: [10, 0, 0] },
];

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

function useDesktopEnhancement() {
  return useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
}

function StepStateContent({
  step,
  demo,
}: {
  step: ReportTransformationStep;
  demo: ReportTransformationDemo;
}) {
  switch (step.id) {
    case "note":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--carnet-blue)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            Note technique
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/78">
            {demo.observation}
          </p>
        </div>
      );
    case "structure":
      return (
        <dl className="mt-5 grid max-w-xl grid-cols-2 gap-x-5 gap-y-3 text-sm">
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Zone
            </dt>
            <dd className="mt-1 text-white/78">Thorax</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Côté
            </dt>
            <dd className="mt-1 text-white/78">Gauche</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Observation structurée
            </dt>
            <dd className="mt-1 leading-6 text-white/78">{demo.observation}</dd>
          </div>
        </dl>
      );
    case "language":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--carnet-blue)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            Proposition adaptée
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/78">
            {demo.adaptedProposal}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/65">{demo.help}</p>
        </div>
      );
    case "final":
      return (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          <span className="text-[color:var(--carnet-green)]">
            {demo.finalStatus}
          </span>
          <span className="text-white/55">{demo.fileName}</span>
        </div>
      );
  }
}

function TransformationStep({
  step,
  index,
  progress,
  enhanced,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
  demo: ReportTransformationDemo;
}) {
  const range = stepRanges[index] ?? stepRanges[0]!;
  const opacity = useTransform(progress, range.input, range.opacity);
  const y = useTransform(progress, range.input, range.y);

  return (
    <m.li
      data-report-state={step.id}
      className="border-t border-white/14 py-8 md:min-h-72 md:py-12"
      style={enhanced ? { opacity, y } : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-[4.5rem_1fr]">
        <span className="font-mono text-xs text-white/60">0{index + 1}</span>
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            {step.label}
          </h3>
          <p className="mt-2 max-w-[44ch] text-sm leading-6 text-white/60 md:text-base md:leading-7">
            {step.body}
          </p>
          <StepStateContent step={step} demo={demo} />
        </div>
      </div>
    </m.li>
  );
}

function DocumentBody({
  step,
  demo,
}: {
  step: ReportTransformationStep;
  demo: ReportTransformationDemo;
}) {
  if (step.id === "note") {
    return (
      <div>
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-muted)]">
          Note technique
        </p>
        <p className="mt-3 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.observation}
        </p>
      </div>
    );
  }

  if (step.id === "structure") {
    return (
      <div>
        <p className="border-l-2 border-[color:var(--carnet-blue)] pl-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          Observation structurée
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Thorax", "Côté gauche", "Mobilité"].map((item) => (
            <span
              key={item}
              className="rounded-full bg-[color:var(--carnet-blue-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-ink)]"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-4 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.observation}
        </p>
      </div>
    );
  }

  if (step.id === "language") {
    return (
      <div>
        <p className="border-l-2 border-[color:var(--carnet-blue)] pl-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          Proposition adaptée
        </p>
        <p className="mt-3 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.adaptedProposal}
        </p>
        <p className="mt-4 border-t border-[color:var(--carnet-line)] pt-4 text-xs leading-5 text-[color:var(--carnet-muted)]">
          {demo.help}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          {demo.finalStatus}
        </p>
        <span className="size-2 rounded-full bg-[color:var(--carnet-green)]" />
      </div>
      <p className="mt-4 text-base leading-7 text-[color:var(--carnet-ink)]">
        {demo.adaptedProposal}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[color:var(--carnet-line)] pt-4">
        <span className="font-mono text-xs text-[color:var(--carnet-muted)]">
          {demo.fileName}
        </span>
        <span className="rounded-full bg-[color:var(--carnet-ink)] px-4 py-2 text-xs font-semibold text-white">
          Partager le PDF
        </span>
      </div>
    </div>
  );
}

function ReportDocumentLayer({
  step,
  index,
  progress,
  enhanced,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
  demo: ReportTransformationDemo;
}) {
  const range = layerRanges[index] ?? layerRanges[0]!;
  const opacity = useTransform(progress, range.input, range.opacity);
  const y = useTransform(progress, range.input, range.y);

  return (
    <m.article
      data-report-layer={step.id}
      className="report-document-layer overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-black/10 bg-[color:var(--carnet-surface)] text-[color:var(--carnet-ink)] shadow-[0_42px_100px_-58px_rgba(0,0,0,0.65)]"
      style={enhanced ? { opacity, y } : undefined}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--carnet-line)] px-6 py-5">
        <div>
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
            Compte rendu propriétaire
          </p>
          <p className="mt-1 text-sm font-semibold">Séance · Cheval</p>
        </div>
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          0{index + 1} / 04
        </span>
      </div>
      <div className="min-h-72 px-6 py-7">
        <DocumentBody step={step} demo={demo} />
      </div>
    </m.article>
  );
}

function ReportDocumentSequence({
  demo,
  progress,
  enhanced,
}: {
  demo: ReportTransformationDemo;
  progress: MotionValue<number>;
  enhanced: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={enhanced ? "hidden md:sticky md:top-28 md:block" : "hidden"}
    >
      <div className="relative pl-6">
        <div className="absolute bottom-4 left-0 top-4 w-px overflow-hidden bg-white/16">
          <m.div
            className="h-full w-full origin-top bg-[linear-gradient(to_bottom,#6b5ac8,#5d9bb8,#2e9866)]"
            style={{ scaleY: progress }}
          />
        </div>
        <div className="report-document-layers">
          {demo.steps.map((step, index) => (
            <ReportDocumentLayer
              key={step.id}
              step={step}
              index={index}
              progress={progress}
              enhanced={enhanced}
              demo={demo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportTransformationStory({
  demo,
}: Readonly<{ demo: ReportTransformationDemo }>) {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useDesktopEnhancement();
  const reduceMotion = useReducedMotion();
  const enhanced = isDesktop && reduceMotion === false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={sectionRef}
        id="produit"
        data-landing-section="transformation"
        className={`scroll-mt-18 bg-[color:var(--carnet-anthracite)] px-4 py-12 text-white sm:px-6 md:py-20 lg:px-8 ${
          enhanced ? "md:min-h-[160svh]" : ""
        }`}
      >
        <div className="mx-auto max-w-[90rem]">
          <div className="max-w-4xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-blue)]">
              Du geste au document
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl lg:text-7xl">
              Une note devient un document que le propriétaire peut{" "}
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                comprendre.
              </span>
            </h2>
          </div>

          <div
            className={`mt-12 gap-14 lg:mt-16 ${
              enhanced
                ? "md:grid md:grid-cols-[0.84fr_1.16fr] md:items-start"
                : ""
            }`}
          >
            <ol>
              {demo.steps.map((step, index) => (
                <TransformationStep
                  key={step.id}
                  step={step}
                  index={index}
                  progress={scrollYProgress}
                  enhanced={enhanced}
                  demo={demo}
                />
              ))}
            </ol>
            <ReportDocumentSequence
              demo={demo}
              progress={scrollYProgress}
              enhanced={enhanced}
            />
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
