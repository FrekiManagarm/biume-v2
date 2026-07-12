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
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("uses motion values without frame state or unsafe scroll code", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/report-transformation-story.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toContain("LazyMotion");
    expect(source).toContain("domAnimation");
    expect(source).toContain("useScroll");
    expect(source).toContain("useTransform");
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("useSyncExternalStore");
    expect(source).not.toContain("useState(");
    expect(source).not.toContain("useMotionValueEvent");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain("window.scrollY");
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toContain("repeat: Infinity");
    expect(source).not.toContain("28vh");
    expect(source).not.toContain("22vh");
  });
});
