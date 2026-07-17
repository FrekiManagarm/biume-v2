import { describe, expect, test } from "bun:test";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";

describe("report transformation demo", () => {
  test("keeps the approved notes-to-review factual content", () => {
    expect(REPORT_TRANSFORMATION_DEMO).toEqual({
      note: "Restriction thoracique gauche. Mobilité améliorée après travail. Conseiller du calme pendant 48 h.",
      sections: [
        { label: "Zone observée", value: "Thorax gauche" },
        {
          label: "Évolution",
          value: "Mobilité améliorée après le travail manuel",
        },
        {
          label: "Conseil",
          value: "Prévoir une activité calme pendant 48 heures",
        },
      ],
      ownerSummary:
        "La mobilité du thorax a été travaillée pendant la séance. Prévoyez une activité calme pendant les prochaines 48 heures.",
    });
  });

  test("contains no unsupported outcome or diagnosis claim", () => {
    const serialized = JSON.stringify(REPORT_TRANSFORMATION_DEMO);

    for (const forbidden of [
      "diagnostic",
      "guéri",
      "timeline",
      "retour propriétaire",
      "J+7",
    ]) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
