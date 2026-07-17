import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PractitionerControl } from "../components/landing/practitioner-control";
import { textOnly } from "./landing-test-utils";

describe("practitioner control", () => {
  test("shows source, editable owner version and explicit validation", () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const text = textOnly(html);

    expect(text).toContain("Biume prépare. Vous gardez la main.");
    expect(text).toContain("Texte professionnel");
    expect(text).toContain("Version propriétaire");
    expect(text).toContain("Reformuler");
    expect(text).toContain("Valider ce passage");
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(html).toContain('data-control-status="ready"');
  });
});
