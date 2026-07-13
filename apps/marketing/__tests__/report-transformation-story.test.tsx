import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import {
  REPORT_NOTE_SUMMARY,
  REPORT_TRANSFORMATION_DEMO,
} from "../components/landing/report-transformation-demo";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("report transformation story", () => {
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
    expect(html).toContain('id="comment-ca-marche"');
    expect(html).not.toContain("data-report-state");
    expect(html).not.toContain("data-report-layer");
    expect(html).not.toContain("md:min-h-[160svh]");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
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

    expect(source).toContain("useEffect");
    expect(source).toContain("IntersectionObserver");
    expect(source).toContain('section.dataset.reportMotion = "ready"');
    expect(source).toContain('section.dataset.reportEnhanced = "true"');
    expect(source).toContain("observer.disconnect()");
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
    expect(css).not.toContain(".report-document-layer");
    expect(css).not.toContain("[data-report-active=");
    expect(css).not.toContain("[data-report-progress]");
  });
});
