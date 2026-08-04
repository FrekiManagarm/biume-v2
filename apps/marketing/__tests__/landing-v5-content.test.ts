import { describe, expect, test } from "bun:test";

import {
  BOUNDARIES,
  CONTROL_PASSAGES,
  DEMO_URL,
  FAQ,
  FACTS,
  FOLLOW_UP,
  HERO_LEAD,
  HERO_TITLE,
  PRICING_PLAN,
  SPECIMEN_NOTE,
  SPECIMEN_STEPS,
  SPECIMEN_SUBJECT,
  TRIAL_NOTE,
} from "../components/landing-v5/content";

describe("landing-v5 content", () => {
  test("locks the hero promise exactly", () => {
    expect(HERO_TITLE).toBe("Vos notes de séance, lisibles par le propriétaire.");
    expect(HERO_LEAD).toContain("Biume le met en forme pour le propriétaire.");
    expect(TRIAL_NOTE).toBe("15 jours d'essai, sans carte bancaire");
    expect(DEMO_URL).toBe("https://cal.com/mathieu-chambaud-biume");
  });

  test("never promises an elapsed time and never invents proof", () => {
    const serialized = JSON.stringify({
      FACTS,
      CONTROL_PASSAGES,
      FOLLOW_UP,
      BOUNDARIES,
      FAQ,
      SPECIMEN_STEPS,
    });

    expect(serialized).not.toMatch(/moins de cinq minutes/i);
    expect(serialized).not.toMatch(/témoignage|avis client|utilisateurs actifs/i);
  });

  test("locks the four specimen steps and the fictional-session note", () => {
    expect(SPECIMEN_SUBJECT).toBe("Nashira · jument selle français · 11 ans");
    expect(SPECIMEN_STEPS).toHaveLength(4);
    expect(SPECIMEN_STEPS.map((step) => step.id)).toEqual([
      "motif",
      "examen",
      "traitement",
      "suites",
    ]);
    expect(SPECIMEN_STEPS[0]!.raw).toContain("raideur post-transport");
    expect(SPECIMEN_NOTE).toContain("Séance fictive");
  });

  test("locks pricing values from a single source", () => {
    expect(PRICING_PLAN.monthly.price).toBe("29,99 €");
    expect(PRICING_PLAN.annual.price).toBe("24,99 €");
    expect(PRICING_PLAN.annual.note).toBe(
      "Facturé annuellement · 299,88 € par an",
    );
    expect(PRICING_PLAN.included).toHaveLength(5);
  });

  test("locks all six FAQ entries", () => {
    expect(FAQ).toHaveLength(6);
    expect(FAQ[0]!.q).toBe("Est-ce que Biume écrit à ma place ?");
  });
});
