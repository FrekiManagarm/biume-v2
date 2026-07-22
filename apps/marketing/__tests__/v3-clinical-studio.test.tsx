import { describe, expect, test } from "bun:test";

import V3Page, { metadata } from "../app/v3/page";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("V3 Clinical Studio landing", () => {
  test("keeps the route private to experiments", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toContain("Biume");
  });

  test("keeps the approved practitioner workflow and conversion links", () => {
    const html = renderWithLandingImageConfig(<V3Page />);
    const content = textOnly(html);

    expect(content).toContain("Vos notes gardent votre regard.");
    expect(content).toContain("Vous relisez, adaptez et validez");
    expect(content).toContain("ostéopathes animaliers indépendants");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain(`href="${webAppPath("/signin")}"`);
    expect(html).toContain('data-conversion="v3-hero-signup"');
    expect(html).toContain('data-conversion="v3-pricing-signup"');
    expect(html).not.toContain("diagnostic");
    expect(html).not.toContain("guéri");
  });

  test("shows the note-to-validation journey as three labelled stages", () => {
    const html = renderWithLandingImageConfig(<V3Page />);

    for (const label of ["01 — Observer", "02 — Préparer", "03 — Valider"]) {
      expect(html).toContain(label);
    }

    expect(html).toContain('id="fonctionnement"');
    expect(html).toContain(
      'aria-label="Parcours de la note au compte rendu"',
    );
  });
});
