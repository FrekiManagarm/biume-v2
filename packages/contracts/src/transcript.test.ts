import { describe, expect, it } from "vitest";

import {
  canTransitionTranscript,
  correctTranscriptRequestSchema,
  transcriptMaxCharacters,
  transcriptSchema,
} from "./transcript";

const transcript = {
  captureId: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70",
  status: "ready" as const,
  text: "Séance sur Filou, tension lombaire à droite.",
  language: "fr",
  provider: "openai:gpt-4o-transcribe",
  correctedAt: null,
  createdAt: "2026-08-21T10:00:00.000Z",
  updatedAt: "2026-08-21T10:00:30.000Z",
};

describe("contrat de transcription", () => {
  it("accepte une transcription prête", () => {
    expect(transcriptSchema.parse(transcript)).toEqual(transcript);
  });

  /**
   * Une dictée inaudible produit une transcription vide et un état explicite.
   * Le produit ne remplit jamais un silence par un texte plausible.
   */
  it("accepte un texte vide sur un état inaudible", () => {
    expect(
      transcriptSchema.parse({ ...transcript, status: "inaudible", text: "" })
        .text,
    ).toBe("");
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      transcriptSchema.parse({ ...transcript, objectKey: "captures/x" }),
    ).toThrow();
  });

  it("borne la longueur du texte", () => {
    expect(() =>
      transcriptSchema.parse({
        ...transcript,
        text: "a".repeat(transcriptMaxCharacters + 1),
      }),
    ).toThrow();
  });
});

describe("transitions d'état", () => {
  it("suit le chemin nominal", () => {
    expect(canTransitionTranscript("pending", "running")).toBe(true);
    expect(canTransitionTranscript("running", "ready")).toBe(true);
    expect(canTransitionTranscript("ready", "corrected")).toBe(true);
  });

  it("autorise un nouvel essai après un échec réessayable", () => {
    expect(canTransitionTranscript("failed", "running")).toBe(true);
  });

  /**
   * Une transcription corrigée par le praticien est du travail humain. Aucune
   * relance automatique ne doit pouvoir la remplacer.
   */
  it("interdit d'écraser une correction humaine", () => {
    expect(canTransitionTranscript("corrected", "running")).toBe(false);
    expect(canTransitionTranscript("corrected", "ready")).toBe(false);
  });

  it("rend les états terminaux terminaux", () => {
    expect(canTransitionTranscript("inaudible", "running")).toBe(false);
  });
});

describe("correction", () => {
  it("accepte un texte corrigé", () => {
    expect(
      correctTranscriptRequestSchema.parse({
        text: "Filou, tension lombaire droite.",
      }),
    ).toMatchObject({ text: "Filou, tension lombaire droite." });
  });

  it("accepte un texte vidé par le praticien", () => {
    expect(correctTranscriptRequestSchema.parse({ text: "" }).text).toBe("");
  });

  it("rejette un texte au-delà de la borne", () => {
    expect(() =>
      correctTranscriptRequestSchema.parse({
        text: "a".repeat(transcriptMaxCharacters + 1),
      }),
    ).toThrow();
  });
});
