import { describe, expect, it, vi } from "vitest";

import {
  runExtraction,
  type ExtractionDeps,
} from "./extract-report.trigger";

const input = {
  reportId: "report-1",
  captureId: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70",
};

const transcript = "Filou présente une tension lombaire à droite.";

const candidate = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  anchor: { start: 19, end: 44, quote: "tension lombaire à droite" },
};

type Mocked = {
  loadTranscript: ReturnType<typeof vi.fn>;
  repository: {
    listByReport: ReturnType<typeof vi.fn>;
    replace: ReturnType<typeof vi.fn>;
    syncSectionStates: ReturnType<typeof vi.fn>;
  };
  extractor: { extract: ReturnType<typeof vi.fn> };
};

function createDeps(overrides: Partial<Mocked> = {}): ExtractionDeps & Mocked {
  return {
    loadTranscript: vi.fn(async () => ({
      status: "corrected",
      text: transcript,
    })),
    repository: {
      listByReport: vi.fn(async () => []),
      replace: vi.fn(async () => {}),
      syncSectionStates: vi.fn(async () => {}),
    },
    extractor: { extract: vi.fn(async () => ({ proposals: [candidate] })) },
    newId: () => "proposal-nouveau",
    now: () => new Date("2026-08-21T10:00:00.000Z"),
    ...overrides,
  } as unknown as ExtractionDeps & Mocked;
}

describe("orchestration de l'extraction", () => {
  it("écrit les propositions ancrées", async () => {
    const deps = createDeps();

    expect(await runExtraction(deps, input)).toBe("extracted");
    expect(deps.repository.replace).toHaveBeenCalledWith(
      "report-1",
      [],
      expect.arrayContaining([
        expect.objectContaining({ text: "Tension lombaire droite" }),
      ]),
    );
  });

  /**
   * Le parcours est séquentiel : on corrige la transcription, puis on extrait.
   * Extraire depuis un texte encore en cours produirait un brouillon à jeter.
   */
  it("refuse d'extraire tant que la transcription n'est pas prête", async () => {
    const deps = createDeps({
      loadTranscript: vi.fn(async () => ({ status: "running", text: "" })),
    });

    expect(await runExtraction(deps, input)).toBe("transcript_not_ready");
    expect(deps.extractor.extract).not.toHaveBeenCalled();
  });

  it("ne produit rien depuis une dictée inaudible", async () => {
    const deps = createDeps({
      loadTranscript: vi.fn(async () => ({ status: "inaudible", text: "" })),
    });

    expect(await runExtraction(deps, input)).toBe("nothing_to_extract");
    expect(deps.repository.replace).not.toHaveBeenCalled();
  });

  it("écarte une proposition inventée sans perdre les autres", async () => {
    const deps = createDeps({
      extractor: {
        extract: vi.fn(async () => ({
          proposals: [
            candidate,
            {
              section: "clinical" as const,
              kind: "observation" as const,
              text: "Fracture du bassin",
              anchor: { start: 0, end: 18, quote: "fracture du bassin" },
            },
          ],
        })),
      },
    });

    expect(await runExtraction(deps, input)).toBe("extracted");
    const [, , inserted] = deps.repository.replace.mock.calls[0];
    expect(inserted).toHaveLength(1);
    expect(JSON.stringify(inserted)).not.toContain("Fracture");
  });

  it("préserve une proposition déjà confirmée", async () => {
    const deps = createDeps({
      repository: {
        listByReport: vi.fn(async () => [
          {
            id: "proposal-confirme",
            reportId: "report-1",
            section: "clinical",
            kind: "observation",
            text: "Tension lombaire droite",
            state: "confirmed",
            anchor: candidate.anchor,
            decidedAt: "2026-08-21T09:00:00.000Z",
          },
        ]),
        replace: vi.fn(async () => {}),
        syncSectionStates: vi.fn(async () => {}),
      },
    });

    await runExtraction(deps, input);
    const [, toDelete, toInsert] = deps.repository.replace.mock.calls[0];

    expect(toDelete).not.toContain("proposal-confirme");
    expect(toInsert).toHaveLength(0);
  });

  it("met à jour les états de section après écriture", async () => {
    const deps = createDeps();
    await runExtraction(deps, input);

    expect(deps.repository.syncSectionStates).toHaveBeenCalledWith(
      "report-1",
      expect.objectContaining({ clinical: "proposed", anatomical: "empty" }),
    );
  });

  it("normalise un échec du modèle sans détail technique", async () => {
    const deps = createDeps({
      extractor: {
        extract: vi.fn(async () => {
          throw new Error("openai 429 req_abc123");
        }),
      },
    });

    expect(await runExtraction(deps, input)).toBe("failed");
    expect(deps.repository.replace).not.toHaveBeenCalled();
  });
});
