import { transcriptMaxCharacters } from "@biume/contracts/transcript";
import { describe, expect, it } from "vitest";

import {
  buildTranscriptionPrompt,
  classifyTranscriptResult,
  truncateTranscript,
} from "./transcription.service";

describe("amorçage du modèle", () => {
  /**
   * L'amorçage est ce qui fait la différence sur du français spécialisé : sans
   * lui, « L5 » devient « elle cinq » et « sacro-iliaque » une bouillie.
   */
  it("porte le lexique métier", () => {
    const prompt = buildTranscriptionPrompt({
      patientName: null,
      species: null,
    });

    expect(prompt).toContain("sacro-iliaque");
    expect(prompt).toContain("lombaire");
  });

  it("nomme l'animal quand la fiche le connaît", () => {
    expect(
      buildTranscriptionPrompt({ patientName: "Filou", species: "DOG" }),
    ).toContain("Filou");
  });

  it("reste valide quand la capture est libre", () => {
    const prompt = buildTranscriptionPrompt({
      patientName: null,
      species: null,
    });

    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).not.toContain("null");
    expect(prompt).not.toContain("undefined");
  });

  /**
   * Le paramètre d'amorçage d'OpenAI est borné. Un lexique qui déborde est
   * tronqué en silence par le fournisseur, donc on le borne nous-mêmes.
   */
  it("reste sous la borne d'amorçage", () => {
    expect(
      buildTranscriptionPrompt({ patientName: "Filou", species: "DOG" }).length,
    ).toBeLessThanOrEqual(1000);
  });
});

describe("classification du résultat", () => {
  it("marque prête une transcription substantielle", () => {
    expect(
      classifyTranscriptResult({ text: "Séance sur Filou, tension lombaire." }),
    ).toEqual({
      status: "ready",
      text: "Séance sur Filou, tension lombaire.",
    });
  });

  it("marque inaudible une transcription vide", () => {
    expect(classifyTranscriptResult({ text: "   " })).toEqual({
      status: "inaudible",
      text: "",
    });
  });

  /**
   * Les modèles de transcription produisent des artefacts connus sur du
   * silence. Les laisser passer ferait croire au praticien qu'une dictée a été
   * captée alors qu'il n'y avait rien.
   */
  it("marque inaudible un artefact de silence connu", () => {
    expect(
      classifyTranscriptResult({
        text: "Sous-titres réalisés par la communauté d'Amara.org",
      }).status,
    ).toBe("inaudible");
    expect(
      classifyTranscriptResult({ text: "Merci d'avoir regardé cette vidéo !" })
        .status,
    ).toBe("inaudible");
  });

  it("normalise les espaces de bord", () => {
    expect(classifyTranscriptResult({ text: "  Filou va bien.  " }).text).toBe(
      "Filou va bien.",
    );
  });
});

describe("bornage du texte", () => {
  it("laisse un texte court intact", () => {
    expect(truncateTranscript("Filou va bien.")).toBe("Filou va bien.");
  });

  it("borne un texte trop long", () => {
    expect(
      truncateTranscript("a".repeat(transcriptMaxCharacters + 500)),
    ).toHaveLength(transcriptMaxCharacters);
  });
});
