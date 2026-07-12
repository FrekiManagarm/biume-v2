import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("report transformation story", () => {
  test("exposes every state and factual field before hydration", () => {
    const demo = REPORT_TRANSFORMATION_DEMO;
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={demo} />,
    );
    const text = textOnly(html);

    expect(html.match(/data-report-state=/g)).toHaveLength(4);
    expect(html.match(/data-report-layer=/g)).toHaveLength(4);
    for (const label of [
      "Noter",
      "Structurer",
      "Adapter le langage",
      "Finaliser",
    ]) {
      expect(html).toContain(label);
    }
    expect(text).toContain(demo.observation);
    expect(text).toContain(demo.adaptedProposal);
    expect(text).toContain(demo.help);
    expect(html).toContain(demo.fileName);
    expect(html).toContain(demo.finalStatus);
    expect(html).toContain("Note technique");
    expect(html).toContain("Proposition adaptée");
    expect(html).toContain("data-report-final-status");
    expect(html).toContain("data-report-final-dot");
    expect(html).toMatch(
      /data-report-final-status[^>]*class="[^"]*text-white/,
    );
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("renders the editorial story entirely on the server", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/report-transformation-story.tsx",
        import.meta.url,
      ),
    ).text();
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />,
    );

    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("IntersectionObserver");
    expect(source).not.toContain('from "motion/react"');
    expect(html).toContain("Scène 02 · La trace");
    expect(html).toContain('data-report-raccord="gesture-to-document"');
    expect(html).not.toMatch(exactZeroOpacity);
  });
});
