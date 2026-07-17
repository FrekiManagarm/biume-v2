import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("report transformation story", () => {
  test("renders the visible notes-to-report transformation before hydration", () => {
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />,
    );
    const text = textOnly(html);

    for (const copy of [
      "Voyez vos notes prendre forme.",
      "Notes de séance",
      "Restriction thoracique gauche",
      "Biume organise",
      "Synthèse propriétaire",
      "La mobilité du thorax a été travaillée pendant la séance.",
      "Vous relisez",
      "Prêt à relire",
    ]) {
      expect(text).toContain(copy);
    }

    expect(html.match(/data-transformation-stage=/g)).toHaveLength(3);
    const reviewStage = html.match(
      /<article\b[^>]*data-transformation-stage="review"[^>]*>([\s\S]*?)<\/article>/,
    )?.[1];
    expect(reviewStage).toContain("machine-violet-soft");
    expect(reviewStage).toContain("machine-violet");
    expect(reviewStage).not.toContain("machine-green");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("uses a one-shot motion enhancement without scroll listeners", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/report-transformation-story.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toContain('from "motion/react"');
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("whileInView");
    expect(source).toContain("viewport={{ once: true");
    expect(source).not.toContain("repeat");
    expect(source).not.toContain('window.addEventListener("scroll")');
  });
});
