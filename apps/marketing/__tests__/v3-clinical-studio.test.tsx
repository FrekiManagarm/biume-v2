import { describe, expect, mock, test } from "bun:test";

import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

mock.module("next/font/google", () => ({
  Fraunces: () => ({ variable: "font-v3-display" }),
  Instrument_Sans: () => ({ variable: "font-v3-sans" }),
}));

const { default: V3Page, metadata } = await import("../app/v3/page");

describe("V3 Clinical Studio landing", () => {
  test("uses the Clinical Studio scan effects without a reduced-motion override", async () => {
    const css = await Bun.file(
      new URL("../app/v3/v3.css", import.meta.url),
    ).text();

    expect(css).toContain("@keyframes v3-scan");
    expect(css).toContain("@keyframes v3-reveal");
    expect(css).toContain(".v3-journey-track");
    expect(css).not.toContain("prefers-reduced-motion");
  });

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

  test("makes annual billing and the approved plan inclusions explicit", () => {
    const content = textOnly(renderWithLandingImageConfig(<V3Page />));

    expect(content).toContain("24,99 € / mois");
    expect(content).toContain("Facturé annuellement.");
    expect(content).toContain("29,99 € sans engagement");
    expect(content).toContain(
      "Reformulation et validation passage par passage",
    );
    expect(content).toContain("Suivi et rappel après séance");
  });
});
