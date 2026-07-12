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

  test("enhances the sticky story without shipping the motion runtime", async () => {
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
    expect(source).toContain("new Map<HTMLElement, number>()");
    expect(source).toContain("intersectionRatios.set");
    expect(source).toContain("matchMedia");
    expect(source).toContain("reportActive");
    expect(source).not.toContain('from "motion/react"');
    expect(source).not.toContain("LazyMotion");
    expect(source).not.toContain("useScroll");
    expect(source).not.toContain("useTransform");
    expect(source).not.toContain("useReducedMotion");
    expect(source).not.toContain("useSyncExternalStore");
    expect(source).not.toContain("useState(");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain("window.scrollY");
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toContain("repeat: Infinity");
    expect(source).not.toContain("28vh");
    expect(source).not.toContain("22vh");
    expect(css).toContain('[data-report-enhanced="true"]');
    expect(css).toContain(".report-document-sequence");
    expect(css).toMatch(
      /\.report-document-layer\s*{[^}]*visibility:\s*hidden/s,
    );
    expect(css).not.toMatch(
      /\.report-document-layer[^}]*opacity:\s*0/s,
    );
    expect(css).not.toMatch(
      /\[data-report-enhanced="true"\]\s+\[data-report-state\][^}]*opacity:/s,
    );
  });
});
