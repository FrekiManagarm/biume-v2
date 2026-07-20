import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { TransformationWorkshop } from "../components/landing/transformation-workshop";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("transformation workshop", () => {
  test("renders all three factual stages before hydration", () => {
    const html = renderToStaticMarkup(
      <TransformationWorkshop demo={REPORT_TRANSFORMATION_DEMO} />,
    );
    const text = textOnly(html);

    expect(text).toContain("Ce que vous notez reste précis.");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.note);
    expect(text).toContain("Reformulation proposée");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.ownerSummary);
    expect(html.match(/data-transformation-stage=/g)).toHaveLength(3);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("isolates motion in a reduced-motion client leaf", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/transformation-motion.tsx",
        import.meta.url,
      ),
    ).text();
    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("useReducedMotion");
    expect(source).toContain('from "motion/react"');
    expect(source).not.toMatch(/window\.addEventListener\(["']scroll/);
    expect(source).not.toMatch(/opacity\s*:\s*0/);
  });
});
