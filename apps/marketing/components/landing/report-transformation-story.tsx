"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";

import {
  REPORT_NOTE_SUMMARY,
  type ReportTransformationDemo,
} from "./report-transformation-demo";

const reducedMotionMediaQuery = "(prefers-reduced-motion: reduce)";
const reportRevealThreshold = 0.24;
const reportTokens = ["Thorax", "Gauche", "Évolution"] as const;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type ReportIntersectionEntry = Pick<
  IntersectionObserverEntry,
  "isIntersecting" | "intersectionRatio"
>;

type ReportObserver = Readonly<{
  observe: (target: HTMLElement) => void;
  disconnect: () => void;
}>;

type CreateReportObserver = (
  callback: (entries: readonly ReportIntersectionEntry[]) => void,
  options: Readonly<{ threshold: number }>,
) => ReportObserver;

export function shouldEnhanceReport(
  entry: ReportIntersectionEntry | undefined,
) {
  return Boolean(
    entry?.isIntersecting &&
      entry.intersectionRatio >= reportRevealThreshold,
  );
}

export function setupReportEnhancement({
  section,
  reduceMotion,
  createObserver,
}: Readonly<{
  section: HTMLElement | null;
  reduceMotion: boolean;
  createObserver: CreateReportObserver | undefined;
}>) {
  if (!section || reduceMotion || !createObserver) {
    return;
  }

  section.dataset.reportMotion = "ready";

  const observer = createObserver(
    (entries) => {
      const entry = entries[0];

      if (!shouldEnhanceReport(entry)) {
        return;
      }

      section.dataset.reportEnhanced = "true";
      observer.disconnect();
    },
    { threshold: reportRevealThreshold },
  );

  observer.observe(section);

  return () => {
    observer.disconnect();
    delete section.dataset.reportMotion;
    delete section.dataset.reportEnhanced;
  };
}

function useReportEnhancement(sectionRef: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const reduceMotion = window.matchMedia(reducedMotionMediaQuery).matches;
    const createObserver: CreateReportObserver | undefined =
      "IntersectionObserver" in window
        ? (callback, options) =>
            new IntersectionObserver((entries) => callback(entries), options)
        : undefined;

    return setupReportEnhancement({
      section,
      reduceMotion,
      createObserver,
    });
  }, [sectionRef]);
}

function SourceNote() {
  return (
    <article
      data-report-note
      aria-labelledby="report-note-title"
      className="report-note-card self-center rounded-[0.75rem_0.75rem_2rem_0.75rem] border border-white/12 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_28px_70px_-52px_rgb(0_0_0/0.8)]"
    >
      <div className="flex items-center justify-between gap-4">
        <h3
          id="report-note-title"
          className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-logo-violet)]"
        >
          Votre note de séance
        </h3>
        <span aria-hidden="true" className="font-mono text-xs text-white/55">
          01
        </span>
      </div>
      <p className="mt-6 border-l-2 border-[color:var(--carnet-violet)] pl-4 text-base leading-7 text-white/82">
        {REPORT_NOTE_SUMMARY}
      </p>
      <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-4 font-mono text-[0.65rem] text-white/55">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-[color:var(--carnet-violet)]"
        />
        Vos mots restent la source
      </div>
    </article>
  );
}

function TransformationBridge() {
  return (
    <div
      data-report-bridge
      className="relative flex min-h-52 items-center justify-center py-8 md:min-h-0 md:py-0"
    >
      <span
        aria-hidden="true"
        className="report-bridge-line absolute inset-y-4 left-1/2 w-px md:inset-x-0 md:top-1/2 md:bottom-auto md:h-px md:w-auto"
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2 rounded-xl bg-[color:var(--carnet-anthracite)] px-4 py-3">
          <span aria-hidden="true" className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[color:var(--carnet-logo-violet)]" />
            <span className="size-1.5 rounded-full bg-[color:var(--carnet-logo-blue)]" />
            <span className="size-1.5 rounded-full bg-[color:var(--carnet-logo-green)]" />
          </span>
          <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/78">
            Biume organise
          </span>
        </div>
        <div className="flex max-w-44 flex-wrap justify-center gap-2">
          {reportTokens.map((token, index) => (
            <span
              key={token}
              data-report-token
              style={{ "--token-index": index } as CSSProperties}
              className="rounded-full border border-white/12 bg-[color:var(--carnet-anthracite)] px-2.5 py-1 font-mono text-[0.6rem] text-white/64"
            >
              {token}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OwnerDocument({ demo }: { demo: ReportTransformationDemo }) {
  return (
    <article
      data-report-document
      aria-labelledby="report-document-title"
      className="report-owner-document self-center rounded-[0.75rem_0.75rem_0.75rem_2rem] border border-black/8 bg-[color:var(--carnet-surface)] p-6 text-[color:var(--carnet-ink)] shadow-[0_38px_90px_-54px_rgb(0_0_0/0.72)]"
    >
      <div className="flex items-center justify-between gap-4">
        <h3
          id="report-document-title"
          className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-muted)]"
        >
          Proposition propriétaire
        </h3>
        <span
          aria-hidden="true"
          className="font-mono text-xs text-[color:var(--carnet-muted)]"
        >
          02
        </span>
      </div>
      <div className="mt-6">
        <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--carnet-green-ink)]">
          Ce que le propriétaire peut lire
        </p>
        <p className="mt-3 text-base leading-7">{demo.adaptedProposal}</p>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--carnet-line)] pt-4 font-mono text-[0.65rem]">
        <span className="text-[color:var(--carnet-muted)]">
          Texte encore modifiable
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-[color:var(--carnet-green-ink)]">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-[color:var(--carnet-green-ink)]"
          />
          Prêt à relire
        </span>
      </div>
    </article>
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
      className="report-story-section scroll-mt-18 bg-[color:var(--carnet-anthracite)] px-4 py-10 text-white sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:gap-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-green)]">
            De vos notes au propriétaire
          </p>
          <div>
            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.05em] md:text-6xl">
              Le même fond.{" "}
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                Une forme enfin lisible.
              </span>
            </h2>
            <p className="mt-5 max-w-[48ch] text-sm leading-6 text-white/60 md:text-base md:leading-7">
              Vous notez librement. Biume organise. Vous relisez.
            </p>
          </div>
        </div>

        <div
          id="comment-ca-marche"
          className="mt-10 scroll-mt-24 md:mt-14 md:grid md:grid-cols-[0.78fr_0.46fr_1.18fr] md:items-center"
        >
          <SourceNote />
          <TransformationBridge />
          <OwnerDocument demo={demo} />
        </div>

        <ol
          data-report-sequence
          className="mt-8 grid grid-cols-3 border-t border-white/12 pt-4 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-white/55 md:mt-10 md:text-xs"
        >
          {["Vous notez", "Biume organise", "Vous décidez"].map((label) => (
            <li
              key={label}
              data-report-sequence-item
              className="border-r border-white/10 px-2 first:pl-0 last:border-r-0 last:pr-0 md:px-4"
            >
              {label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
