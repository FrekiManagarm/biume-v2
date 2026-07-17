import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PractitionerControl } from "../components/landing/practitioner-control";
import { FollowUpFlow } from "../components/landing/follow-up-flow";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("practitioner control and follow-up flow", () => {
  test("renders practitioner decisions and the factual reminder flow before hydration", () => {
    const control = textOnly(renderToStaticMarkup(<PractitionerControl />));

    expect(control).toContain("Biume prépare. Vous décidez.");
    expect(control).toContain("Modifier");
    expect(control).toContain("Reformuler");
    expect(control).toContain("Supprimer");
    expect(control).toContain("Partager après validation");

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
});
