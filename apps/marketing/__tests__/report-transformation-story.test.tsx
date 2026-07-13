import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import {
  ReportTransformationStory,
  setupReportEnhancement,
  shouldEnhanceReport,
} from "../components/landing/report-transformation-story";
import {
  REPORT_NOTE_SUMMARY,
  REPORT_TRANSFORMATION_DEMO,
} from "../components/landing/report-transformation-demo";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("report transformation story", () => {
  test("reveals only at the configured intersection ratio", () => {
    expect(shouldEnhanceReport(undefined)).toBe(false);
    expect(
      shouldEnhanceReport({ isIntersecting: false, intersectionRatio: 1 }),
    ).toBe(false);
    expect(
      shouldEnhanceReport({ isIntersecting: true, intersectionRatio: 0.23 }),
    ).toBe(false);
    expect(
      shouldEnhanceReport({ isIntersecting: true, intersectionRatio: 0.24 }),
    ).toBe(true);
  });

  test("observes once, gates reveal, disconnects, and cleans up", () => {
    const section = { dataset: {} } as HTMLElement;
    let observed: HTMLElement | undefined;
    let disconnects = 0;
    let threshold: number | undefined;
    let notify:
      | ((
          entries: readonly Pick<
            IntersectionObserverEntry,
            "isIntersecting" | "intersectionRatio"
          >[],
        ) => void)
      | undefined;

    const cleanup = setupReportEnhancement({
      section,
      reduceMotion: false,
      createObserver(callback, options) {
        notify = callback;
        threshold = options.threshold;

        return {
          observe(target) {
            observed = target;
          },
          disconnect() {
            disconnects += 1;
          },
        };
      },
    });

    expect(observed).toBe(section);
    expect(threshold).toBe(0.24);
    expect(section.dataset.reportMotion).toBe("ready");
    expect(section.dataset.reportEnhanced).toBeUndefined();

    notify?.([{ isIntersecting: true, intersectionRatio: 0.23 }]);
    expect(section.dataset.reportEnhanced).toBeUndefined();
    expect(disconnects).toBe(0);

    notify?.([{ isIntersecting: true, intersectionRatio: 0.24 }]);
    expect(section.dataset.reportEnhanced).toBe("true");
    expect(disconnects).toBe(1);

    cleanup?.();
    expect(disconnects).toBe(2);
    expect(section.dataset.reportMotion).toBeUndefined();
    expect(section.dataset.reportEnhanced).toBeUndefined();
  });

  test("does not enhance reduced-motion or unsupported environments", () => {
    let observerCreations = 0;
    const createObserver = () => {
      observerCreations += 1;

      return {
        observe() {},
        disconnect() {},
      };
    };
    const reducedSection = { dataset: {} } as HTMLElement;
    const unsupportedSection = { dataset: {} } as HTMLElement;

    expect(
      setupReportEnhancement({
        section: reducedSection,
        reduceMotion: true,
        createObserver,
      }),
    ).toBeUndefined();
    expect(
      setupReportEnhancement({
        section: unsupportedSection,
        reduceMotion: false,
        createObserver: undefined,
      }),
    ).toBeUndefined();
    expect(observerCreations).toBe(0);
    expect(reducedSection.dataset.reportMotion).toBeUndefined();
    expect(unsupportedSection.dataset.reportMotion).toBeUndefined();
  });

  test("renders the compact note-to-owner transformation before hydration", () => {
    const demo = REPORT_TRANSFORMATION_DEMO;
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={demo} />,
    );
    const text = textOnly(html);

    for (const copy of [
      "De vos notes au propriétaire",
      "Le même fond.",
      "Une forme enfin lisible.",
      "Vous notez librement. Biume organise. Vous relisez.",
      REPORT_NOTE_SUMMARY,
      demo.adaptedProposal,
      "Thorax",
      "Gauche",
      "Évolution",
      "Vous notez",
      "Biume organise",
      "Vous décidez",
      "Prêt à relire",
    ]) {
      expect(text).toContain(copy);
    }

    expect(html.match(/data-report-note(?:=|\s|>)/g)).toHaveLength(1);
    expect(html.match(/data-report-bridge(?:=|\s|>)/g)).toHaveLength(1);
    expect(html.match(/data-report-document(?:=|\s|>)/g)).toHaveLength(1);
    expect(html.match(/data-report-token(?:=|\s|>)/g)).toHaveLength(3);
    expect(html).toContain('id="produit"');
    expect(html).toContain('id="comment-ca-marche"');
    expect(html).toContain("md:grid-cols-[0.78fr_0.46fr_1.18fr]");
    const bridgeLineClasses =
      html
        .match(/class="([^"]*report-bridge-line[^"]*)"/)?.[1]
        ?.split(" ") ?? [];
    for (const className of [
      "inset-y-4",
      "left-1/2",
      "w-px",
      "md:inset-x-0",
      "md:top-1/2",
      "md:bottom-auto",
      "md:h-px",
      "md:w-auto",
    ]) {
      expect(bridgeLineClasses).toContain(className);
    }
    expect(html).toContain("var(--carnet-violet)");
    expect(html).toContain("var(--carnet-logo-violet)");
    expect(html).toContain("var(--carnet-logo-blue)");
    expect(html).toContain("var(--carnet-logo-green)");
    expect(html).not.toContain("data-report-state");
    expect(html).not.toContain("data-report-layer");
    expect(html).not.toContain("md:min-h-[160svh]");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
    expect(html).toMatch(
      /<article[^>]*data-report-note[^>]*aria-labelledby="report-note-title"/,
    );
    expect(html).toMatch(/<h3[^>]*id="report-note-title"/);
    expect(html).toMatch(
      /<article[^>]*data-report-document[^>]*aria-labelledby="report-document-title"/,
    );
    expect(html).toMatch(/<h3[^>]*id="report-document-title"/);
    expect(html.match(/aria-hidden="true"[^>]*>0[12]<\/span>/g)).toHaveLength(
      2,
    );

    for (const match of html.matchAll(/text-white\/(\d+)/g)) {
      expect(Number(match[1])).toBeGreaterThanOrEqual(55);
    }
    expect(html).toContain(
      "text-[color:var(--carnet-logo-violet)]",
    );
    expect(html).toContain("text-[color:var(--carnet-logo-green)]");
    expect(html).toContain("text-[color:var(--carnet-green-ink)]");
  });

  test("keeps the bottom sequence to its three labels", () => {
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />,
    );
    const sequence = html.match(
      /<ol[^>]*data-report-sequence[^>]*>([\s\S]*?)<\/ol>/,
    )?.[1];

    expect(sequence).toBeDefined();
    expect(sequence?.match(/data-report-sequence-item(?:=|\s|>)/g)).toHaveLength(
      3,
    );
    expect(textOnly(sequence ?? "")).toBe(
      "Vous notez Biume organise Vous décidez",
    );
    expect(sequence).not.toMatch(/>0[123]</);
  });

  test("adds one-shot progressive enhancement without hiding SSR content", async () => {
    const [source, css] = await Promise.all([
      Bun.file(
        new URL(
          "../components/landing/report-transformation-story.tsx",
          import.meta.url,
        ),
      ).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
    ]);

    expect(source).toContain("useLayoutEffect");
    expect(source).toContain("useIsomorphicLayoutEffect");
    expect(source).toContain("typeof window === \"undefined\"");
    expect(source).toContain("useIsomorphicLayoutEffect(() =>");
    expect(source).not.toContain("  useEffect(() =>");
    expect(source).toContain("IntersectionObserver");
    expect(source).toContain('section.dataset.reportMotion = "ready"');
    expect(source).toContain('section.dataset.reportEnhanced = "true"');
    expect(source).toContain("observer.disconnect()");
    expect(source).toContain("entry.intersectionRatio >= reportRevealThreshold");
    expect(source).toContain("{ threshold: reportRevealThreshold }");
    expect(source).toContain("matchMedia");
    expect(source).not.toContain("new Map<");
    expect(source).not.toContain("intersectionRatios");
    expect(source).not.toContain("reportActive");
    expect(source).not.toContain('from "motion/react"');
    expect(source).not.toContain("useState(");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toMatch(/data-report-note[\s\S]{0,240}min-h/);
    expect(source).not.toMatch(/data-report-document[\s\S]{0,240}min-h/);

    expect(css).toContain('[data-report-motion="ready"]');
    expect(css).toContain('[data-report-enhanced="true"]');
    expect(css).toMatch(
      /\[data-report-motion="ready"\][^{]*\.report-bridge-line\s*{[^}]*transform:\s*scaleX\(0\)/s,
    );
    expect(css).toMatch(
      /\[data-report-enhanced="true"\][^{]*\.report-bridge-line\s*{[^}]*transform:\s*scaleX\(1\)/s,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.report-bridge-line[^{]*{[^}]*transition:\s*none/s,
    );
    expect(css).toMatch(
      /\[data-report-enhanced="true"\]\s+\.report-owner-document\s*{[^}]*transition-delay:\s*300ms/s,
    );
    expect(css).toMatch(
      /\[data-report-enhanced="true"\]\s+\.report-bridge-line\s*{[^}]*720ms[^}]*140ms/s,
    );
    expect(css).toContain(
      "calc(220ms + var(--token-index) * 80ms)",
    );
    expect(css).not.toMatch(
      /\[data-report-(?:motion|enhanced)=[\s\S]*transition[^;]*(?:top|left|width|height)/,
    );
    expect(css).not.toContain(".report-document-layer");
    expect(css).not.toContain("[data-report-active=");
    expect(css).not.toContain("[data-report-progress]");
  });
});
