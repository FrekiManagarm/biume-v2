import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { FollowUpContinuity } from "../components/landing/follow-up-continuity";

describe("follow-up continuity", () => {
  test("orders follow-up continuity and reserves green for confirmation", () => {
    const continuityHtml = renderToStaticMarkup(<FollowUpContinuity />);
    const steps = Array.from(
      continuityHtml.matchAll(
        /<li\b[^>]*data-follow-up-step="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g,
      ),
    );

    expect(steps.map((step) => step[1])).toEqual([
      "Compte rendu finalisé",
      "Suivi préparé",
      "Rappel confirmé",
    ]);
    expect(steps).toHaveLength(3);
    expect(steps[0]?.[2]).not.toContain("atelier-green-soft");
    expect(steps[0]?.[2]).not.toContain("atelier-green-ink");
    expect(steps[1]?.[2]).not.toContain("atelier-green-soft");
    expect(steps[1]?.[2]).not.toContain("atelier-green-ink");
    expect(steps[2]?.[2]).toContain("atelier-green-soft");
    expect(steps[2]?.[2]).toContain("atelier-green-ink");
  });

  test("reveals the ordered steps sequentially without hiding server content", async () => {
    const continuityHtml = renderToStaticMarkup(<FollowUpContinuity />);
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();

    expect(
      continuityHtml.match(/\batelier-sequence-step\b/g),
    ).toHaveLength(3);
    expect(css).toContain(".atelier-sequence-step:nth-child(2)");
    expect(css).toContain(".atelier-sequence-step:nth-child(3)");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.atelier-sequence-step[\s\S]*animation:\s*none/,
    );
    expect(continuityHtml).not.toMatch(/opacity(?:-|:)0(?:\D|$)/);
  });
});
