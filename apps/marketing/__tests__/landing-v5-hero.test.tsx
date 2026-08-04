// apps/marketing/__tests__/landing-v5-hero.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Hero } from "../components/landing-v5/hero";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 hero", () => {
  test("renders the exact promise, both CTAs and the trial note", () => {
    const html = renderWithLandingImageConfig(<LandingV5Hero />);
    const text = textOnly(html);

    expect(text).toContain("Pour les ostéopathes et praticiens animaliers");
    expect(text).toContain("Vos notes de séance, lisibles par le propriétaire.");
    expect(text).toContain("Biume le met en forme pour le propriétaire.");
    expect(text).toContain("Préparer mon premier compte rendu");
    expect(text).toContain("Voir le parcours");
    expect(text).toContain("15 jours d'essai, sans carte bancaire");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="hero-signup"');
    expect(html).toContain('href="#produit"');
  });

  test("renders the product card content and the accessible lateral veil", () => {
    const html = renderWithLandingImageConfig(<LandingV5Hero />);
    const text = textOnly(html);

    expect(text).toContain("Nashira · séance du 12 mars");
    expect(text).toContain("Validé par vous");
    expect(text).toContain("Biume met en forme");
    expect(text).toContain(
      "ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    );
    expect(html).toContain("atelier-hero.webp");
    expect(html.match(/linear-gradient/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html.match(/radial-gradient/g)?.length).toBeGreaterThanOrEqual(1);
  });

  test("is a server component with no client directive", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/hero.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
    expect(source).toContain("<Parallax");
    expect(source).toContain("<Reveal");
  });
});
