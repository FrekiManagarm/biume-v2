import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PractitionerControl } from "../components/landing/practitioner-control";
import { FollowUpFlow } from "../components/landing/follow-up-flow";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("practitioner control and follow-up flow", () => {
  test("renders practitioner decisions and the complete follow-up timeline before hydration", () => {
    const control = textOnly(renderToStaticMarkup(<PractitionerControl />));

    expect(control).toContain("Biume prépare. Vous décidez.");
    expect(control).toContain("Modifier");
    expect(control).toContain("Reformuler");
    expect(control).toContain("Supprimer");
    expect(control).toContain("Partager après validation");

    const flowHtml = renderToStaticMarkup(<FollowUpFlow />);
    const flowText = textOnly(flowHtml);

    expect(flowText).toContain("La séance se termine. Le fil continue.");
    expect(flowText).toContain("Compte rendu envoyé");
    expect(flowText).toContain("Retour à J+7");
    expect(flowText).toContain("Timeline enrichie");
    expect(flowHtml.match(/data-follow-up-step=/g)).toHaveLength(3);
    expect(flowHtml).not.toMatch(exactZeroOpacity);
  });
});
