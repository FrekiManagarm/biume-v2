import { describe, expect, test } from "bun:test";

import {
  REPORT_NOTE_SUMMARY,
  REPORT_TRANSFORMATION_DEMO,
} from "../components/landing/report-transformation-demo";

describe("report transformation demo", () => {
  test("keeps the approved four-state factual content", () => {
    expect(REPORT_TRANSFORMATION_DEMO.steps.map((step) => step.label)).toEqual([
      "Noter",
      "Structurer",
      "Adapter le langage",
      "Finaliser",
    ]);
    expect(REPORT_TRANSFORMATION_DEMO.observation).toBe(
      "Mobilité réduite à gauche et tension modérée observée au niveau thoracique. La mobilité s'est améliorée pendant la séance.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.adaptedProposal).toBe(
      "Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.help).toBe(
      "Cette proposition remplace le texte du champ lorsque vous choisissez de l'appliquer. Elle reste modifiable.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.fileName).toBe("Compte-rendu-seance.pdf");
    expect(REPORT_TRANSFORMATION_DEMO.finalStatus).toBe("Finalisé par vous");
    expect(REPORT_NOTE_SUMMARY).toBe(
      "Mobilité réduite à gauche · thorax. Amélioration pendant la séance.",
    );
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
