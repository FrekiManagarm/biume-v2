import { describe, expect, it } from "vitest";

import {
  buildExtractionPrompt,
  deriveSectionStates,
  mergePreservingDecisions,
  rejectUngroundedProposals,
} from "./extraction.service";

const transcript =
  "Filou présente une tension lombaire à droite. Je recommande du repos une semaine.";

const grounded = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  anchor: { start: 24, end: 49, quote: "tension lombaire à droite" },
};

const invented = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Fracture du bassin",
  anchor: { start: 0, end: 18, quote: "fracture du bassin" },
};

describe("amorçage de l'extraction", () => {
  it("porte la transcription", () => {
    expect(buildExtractionPrompt(transcript)).toContain("tension lombaire");
  });

  /**
   * L'instruction de ne rien inventer est la première ligne de défense ; la
   * vérification des ancres est la seconde. Les deux sont nécessaires.
   */
  it("interdit explicitement d'inventer", () => {
    const prompt = buildExtractionPrompt(transcript);

    expect(prompt).toMatch(/n'invente/i);
    expect(prompt).toMatch(/diagnostic/i);
  });
});

describe("rejet des propositions non ancrées", () => {
  it("garde une proposition dont la citation est dans la transcription", () => {
    expect(rejectUngroundedProposals([grounded], transcript).kept).toHaveLength(
      1,
    );
  });

  it("rejette une proposition inventée", () => {
    const result = rejectUngroundedProposals([invented], transcript);

    expect(result.kept).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("rejette sans faire échouer l'extraction entière", () => {
    const result = rejectUngroundedProposals([grounded, invented], transcript);

    expect(result.kept).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
  });

  it("ne produit rien depuis une transcription vide", () => {
    expect(rejectUngroundedProposals([grounded], "").kept).toHaveLength(0);
  });
});

describe("fusion préservant les décisions", () => {
  const confirmed = {
    id: "proposal-1",
    reportId: "report-1",
    section: "clinical" as const,
    kind: "observation" as const,
    text: "Tension lombaire droite",
    state: "confirmed" as const,
    anchor: grounded.anchor,
    decidedAt: "2026-08-21T10:00:00.000Z",
  };

  const pending = { ...confirmed, id: "proposal-2", state: "proposed" as const };

  /**
   * C'est la traduction directe de « Biume prépare, le praticien décide ». Une
   * régénération que le praticien n'a pas demandée ne doit jamais faire
   * disparaître sous ses yeux le travail qu'il vient de valider.
   */
  it("ne supprime jamais une proposition confirmée", () => {
    const { toDelete } = mergePreservingDecisions([confirmed], [grounded]);

    expect(toDelete).not.toContain("proposal-1");
  });

  it("ne supprime jamais une proposition marquée sans objet", () => {
    const { toDelete } = mergePreservingDecisions(
      [{ ...confirmed, state: "not_applicable" as const }],
      [grounded],
    );

    expect(toDelete).toEqual([]);
  });

  it("remplace les propositions encore à vérifier", () => {
    const { toDelete } = mergePreservingDecisions([pending], [grounded]);

    expect(toDelete).toEqual(["proposal-2"]);
  });

  it("n'insère pas un doublon de ce que le praticien a déjà confirmé", () => {
    const { toInsert } = mergePreservingDecisions([confirmed], [grounded]);

    expect(toInsert).toHaveLength(0);
  });
});

describe("dérivation des états de section", () => {
  const proposal = (
    section: "clinical" | "anatomical" | "recommendations" | "notes",
    state: "proposed" | "confirmed" | "not_applicable",
  ) => ({
    id: `${section}-${state}`,
    reportId: "report-1",
    section,
    kind: "observation" as const,
    text: "x",
    state,
    anchor: grounded.anchor,
    decidedAt: null,
  });

  it("marque à remplir une section sans proposition", () => {
    expect(deriveSectionStates([]).anatomical).toBe("empty");
  });

  it("marque à vérifier une section qui porte une proposition en attente", () => {
    expect(deriveSectionStates([proposal("clinical", "proposed")]).clinical).toBe(
      "proposed",
    );
  });

  it("marque validée une section dont tout est décidé", () => {
    expect(
      deriveSectionStates([proposal("clinical", "confirmed")]).clinical,
    ).toBe("confirmed");
  });

  it("reste à vérifier tant qu'une seule proposition attend", () => {
    expect(
      deriveSectionStates([
        proposal("clinical", "confirmed"),
        { ...proposal("clinical", "proposed"), id: "autre" },
      ]).clinical,
    ).toBe("proposed");
  });

  it("marque sans objet une section entièrement écartée", () => {
    expect(deriveSectionStates([proposal("notes", "not_applicable")]).notes).toBe(
      "not_applicable",
    );
  });
});
