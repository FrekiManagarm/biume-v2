import { describe, expect, test } from "bun:test";

import {
  BOUNDARIES,
  DEMO_URL,
  FAQ,
  FOOTER_COLUMNS,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  NAV_LINKS,
  PRICING_PLAN,
  SPECIMEN_STEPS,
  TRADES,
} from "../components/landing-v5/content";

describe("landing-v5 content", () => {
  test("never promises an elapsed time", () => {
    const serialized = JSON.stringify({
      HERO_TITLE_LINE_1,
      HERO_TITLE_LINE_2,
      BOUNDARIES,
      FAQ,
    }).toLowerCase();
    expect(serialized).not.toMatch(/moins de cinq minutes/);
  });

  test("never invents social proof", () => {
    const serialized = JSON.stringify({ FAQ, BOUNDARIES }).toLowerCase();
    expect(serialized).not.toMatch(/témoignage|avis client|utilisateurs actifs/);
  });

  test("keeps the trades banner scoped to animal-osteopathy practice contexts, not other professions", () => {
    const forbiddenProfessions = ["vétérinaire", "comportementaliste", "toiletteur", "dentiste"];
    const serialized = TRADES.items.join(" ").toLowerCase();
    for (const forbidden of forbiddenProfessions) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  test("annual pricing total is the exact product of the monthly-equivalent price", () => {
    expect(PRICING_PLAN.annual.note).toContain("299,88");
    expect(PRICING_PLAN.annual.price).toBe("24,99 €");
  });

  test("has exactly 4 report tabs and 6 FAQ entries, matching the spec", () => {
    expect(SPECIMEN_STEPS).toHaveLength(4);
    expect(FAQ).toHaveLength(6);
  });

  test("has 5 nav links and demo/trial constants", () => {
    expect(NAV_LINKS).toHaveLength(5);
    expect(DEMO_URL).toBe("https://cal.com/mathieu-chambaud-biume");
  });

  test("footer has exactly 3 SEO columns (Produit, Métiers, Société)", () => {
    expect(FOOTER_COLUMNS).toHaveLength(3);
    expect(FOOTER_COLUMNS.map((c) => c.title)).toEqual([
      "Produit",
      "Métiers",
      "Société",
    ]);
  });
});
