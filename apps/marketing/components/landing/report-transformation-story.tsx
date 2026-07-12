"use client";

import { useEffect, useRef } from "react";

import type {
  ReportTransformationDemo,
  ReportTransformationStep,
} from "./report-transformation-demo";

const desktopMediaQuery = "(min-width: 768px)";
const reducedMotionMediaQuery = "(prefers-reduced-motion: reduce)";

function useReportEnhancement(sectionRef: {
  readonly current: HTMLElement | null;
}) {
  useEffect(() => {
    const section = sectionRef.current;
    const canEnhance = window.matchMedia(desktopMediaQuery).matches;
    const reduceMotion = window.matchMedia(reducedMotionMediaQuery).matches;

    if (!section || !canEnhance || reduceMotion) {
      return;
    }

    const steps = Array.from(
      section.querySelectorAll<HTMLElement>("[data-report-state]"),
    );

    if (steps.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    section.dataset.reportEnhanced = "true";
    section.dataset.reportActive = steps[0]?.dataset.reportState ?? "note";
    const intersectionRatios = new Map<HTMLElement, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersectionRatios.set(
            entry.target as HTMLElement,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        const focusLine = window.innerHeight * 0.38;
        const activeStep = steps
          .map((step) => {
            const rect = step.getBoundingClientRect();

            return {
              step,
              ratio: intersectionRatios.get(step) ?? 0,
              distance: Math.abs(rect.top + rect.height / 2 - focusLine),
            };
          })
          .filter(({ ratio }) => ratio > 0)
          .sort(
            (left, right) =>
              right.ratio - left.ratio || left.distance - right.distance,
          )[0]?.step;
        const activeState = activeStep?.dataset.reportState;

        if (activeState) {
          section.dataset.reportActive = activeState;
        }
      },
      {
        rootMargin: "-28% 0px -52% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const step of steps) {
      observer.observe(step);
    }

    return () => {
      observer.disconnect();
      delete section.dataset.reportEnhanced;
      delete section.dataset.reportActive;
    };
  }, [sectionRef]);
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
          <span
            data-report-final-status
            className="inline-flex items-center gap-2 text-white/78"
          >
            <span
              data-report-final-dot
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
            />
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
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  demo: ReportTransformationDemo;
}) {
  return (
    <li
      data-report-state={step.id}
      className="border-t border-white/14 py-8 md:min-h-72 md:py-12"
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
    </li>
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
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  demo: ReportTransformationDemo;
}) {
  return (
    <article
      data-report-layer={step.id}
      className="report-document-layer overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-black/10 bg-[color:var(--carnet-surface)] text-[color:var(--carnet-ink)] shadow-[0_42px_100px_-58px_rgba(0,0,0,0.65)]"
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
    </article>
  );
}

function ReportDocumentSequence({ demo }: { demo: ReportTransformationDemo }) {
  return (
    <div
      aria-hidden="true"
      data-report-document
      className="report-document-sequence hidden md:sticky md:top-28 md:block"
    >
      <div className="relative pl-6">
        <div className="absolute bottom-4 left-0 top-4 w-px overflow-hidden bg-white/16">
          <div
            data-report-progress
            className="h-full w-full origin-top bg-[linear-gradient(to_bottom,#6b5ac8,#5d9bb8,#2e9866)]"
          />
        </div>
        <div className="report-document-layers">
          {demo.steps.map((step, index) => (
            <ReportDocumentLayer
              key={step.id}
              step={step}
              index={index}
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
  useReportEnhancement(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="produit"
      data-landing-section="transformation"
      className="report-story-section scroll-mt-18 bg-[color:var(--carnet-anthracite)] px-4 py-10 text-white sm:px-6 md:min-h-[160svh] md:py-20 lg:px-8"
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

        <div className="mt-10 gap-14 md:mt-12 md:grid md:grid-cols-[0.84fr_1.16fr] md:items-start lg:mt-16">
          <ol>
            {demo.steps.map((step, index) => (
              <TransformationStep
                key={step.id}
                step={step}
                index={index}
                demo={demo}
              />
            ))}
          </ol>
          <ReportDocumentSequence demo={demo} />
        </div>
      </div>
    </section>
  );
}
