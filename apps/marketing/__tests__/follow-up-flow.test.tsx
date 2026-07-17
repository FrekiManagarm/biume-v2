import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { FollowUpContinuity } from "../components/landing/follow-up-continuity";
import { FollowUpFlow } from "../components/landing/follow-up-flow";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("follow-up flow", () => {
  test("renders the factual reminder flow before hydration", () => {
    const flowHtml = renderToStaticMarkup(<FollowUpFlow />);
    const flowText = textOnly(flowHtml);

    expect(flowText).toContain(
      "La séance se termine. Le suivi se prépare.",
    );
    expect(flowText).toContain("Compte rendu finalisé");
    expect(flowText).toContain("Suivi préparé");
    expect(flowText).toContain("Rappel programmé");
    expect(flowText).toContain(
      "Vous préparez le rappel et choisissez sa date ainsi que son message.",
    );

    const steps = Array.from(
      flowHtml.matchAll(
        /<li\b[^>]*data-follow-up-step="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g,
      ),
    );
    expect(steps).toHaveLength(3);
    expect(steps.map((step) => step[1])).toEqual([
      "Compte rendu finalisé",
      "Suivi préparé",
      "Rappel programmé",
    ]);
    expect(steps[0]?.[2]).not.toContain("machine-green");
    expect(steps[1]?.[2]).not.toContain("machine-green");
    expect(steps[2]?.[2]).toContain("machine-green-soft");
    expect(steps[2]?.[2]).toContain("machine-green-ink");
    expect(flowText).not.toContain("Retour à J+7");
    expect(flowText).not.toContain("Timeline enrichie");
    expect(flowHtml).not.toMatch(exactZeroOpacity);
  });

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
