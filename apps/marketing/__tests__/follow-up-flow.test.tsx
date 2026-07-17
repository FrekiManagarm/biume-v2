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
});
