import { describe, expect, it } from "vitest";

import {
  anchorMatchesTranscript,
  decideProposalRequestSchema,
  proposalSchema,
  reportSectionLabels,
  transcriptAnchorSchema,
} from "./proposal";

const transcript =
  "Filou présente une tension lombaire à droite depuis dix jours.";

const anchor = {
  start: 20,
  end: 45,
  quote: "tension lombaire à droite",
};

const proposal = {
  id: "proposal-1",
  reportId: "report-1",
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  state: "proposed" as const,
  anchor,
  decidedAt: null,
};

describe("ancre de transcription", () => {
  it("accepte un intervalle valide", () => {
    expect(transcriptAnchorSchema.parse(anchor)).toEqual(anchor);
  });

  it("rejette une fin antérieure au début", () => {
    expect(() =>
      transcriptAnchorSchema.parse({ ...anchor, start: 45, end: 20 }),
    ).toThrow();
  });

  it("rejette un intervalle vide", () => {
    expect(() =>
      transcriptAnchorSchema.parse({ ...anchor, start: 20, end: 20 }),
    ).toThrow();
  });

  it("rejette une citation vide", () => {
    expect(() =>
      transcriptAnchorSchema.parse({ ...anchor, quote: "" }),
    ).toThrow();
  });
});

describe("vérification de l'ancre contre la transcription", () => {
  it("valide une ancre dont la citation est bien à sa place", () => {
    expect(anchorMatchesTranscript(anchor, transcript)).toBe(true);
  });

  /**
   * C'est le garde-fou central du produit : une proposition dont la citation ne
   * se retrouve pas dans la transcription est une invention du modèle, et elle
   * doit être rejetée avant d'être montrée au praticien.
   */
  it("rejette une citation absente de la transcription", () => {
    expect(
      anchorMatchesTranscript(
        { start: 0, end: 12, quote: "fracture du bassin" },
        transcript,
      ),
    ).toBe(false);
  });

  it("rejette un intervalle qui déborde la transcription", () => {
    expect(
      anchorMatchesTranscript(
        { start: 0, end: 9999, quote: "Filou" },
        transcript,
      ),
    ).toBe(false);
  });

  it("tolère un décalage d'indices si la citation reste présente", () => {
    expect(
      anchorMatchesTranscript(
        { start: 0, end: 25, quote: "tension lombaire à droite" },
        transcript,
      ),
    ).toBe(true);
  });
});

describe("contrat de proposition", () => {
  it("accepte une proposition complète", () => {
    expect(proposalSchema.parse(proposal)).toEqual(proposal);
  });

  it("rejette une proposition sans ancre", () => {
    expect(() =>
      proposalSchema.parse({ ...proposal, anchor: undefined }),
    ).toThrow();
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      proposalSchema.parse({ ...proposal, confidence: 0.9 }),
    ).toThrow();
  });
});

describe("décision du praticien", () => {
  it("accepte une confirmation", () => {
    expect(decideProposalRequestSchema.parse({ state: "confirmed" })).toEqual({
      state: "confirmed",
    });
  });

  it("accepte un marquage sans objet", () => {
    expect(
      decideProposalRequestSchema.parse({ state: "not_applicable" }),
    ).toEqual({ state: "not_applicable" });
  });

  /**
   * Le mobile valide, il n'édite pas. Repasser une proposition à `proposed`
   * n'est pas une décision de praticien, c'est une régénération.
   */
  it("refuse de replacer une proposition en attente", () => {
    expect(() =>
      decideProposalRequestSchema.parse({ state: "proposed" }),
    ).toThrow();
  });
});

describe("libellés métier", () => {
  it("dit le geste en français, jamais l'état machine", () => {
    expect(reportSectionLabels.empty).toBe("À remplir");
    expect(reportSectionLabels.proposed).toBe("À vérifier");
    expect(reportSectionLabels.needs_confirmation).toBe("À vérifier");
    expect(reportSectionLabels.confirmed).toBe("Validé");
    expect(reportSectionLabels.not_applicable).toBe("Sans objet");
  });
});
