import { describe, expect, it, vi } from "vitest";

import {
  runTranscription,
  type TranscriptionDeps,
} from "./transcribe-capture.trigger";

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";

type Mocked = {
  repository: {
    ensure: ReturnType<typeof vi.fn>;
    markRunning: ReturnType<typeof vi.fn>;
    saveResult: ReturnType<typeof vi.fn>;
    markFailed: ReturnType<typeof vi.fn>;
  };
  loadContext: ReturnType<typeof vi.fn>;
  objectStore: { getBytes: ReturnType<typeof vi.fn> };
  transcriber: { transcribe: ReturnType<typeof vi.fn> };
};

function createDeps(overrides: Partial<Mocked> = {}): TranscriptionDeps & Mocked {
  return {
    repository: {
      ensure: vi.fn(async () => {}),
      markRunning: vi.fn(async () => true),
      saveResult: vi.fn(async () => {}),
      markFailed: vi.fn(async () => {}),
    },
    loadContext: vi.fn(async () => ({
      objectKey: "captures/abc/audio.m4a",
      mimeType: "audio/mp4",
      patientName: "Filou",
      species: "DOG",
    })),
    objectStore: {
      getBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
    },
    transcriber: {
      transcribe: vi.fn(async () => ({ text: "Tension lombaire à droite." })),
    },
    ...overrides,
  } as unknown as TranscriptionDeps & Mocked;
}

describe("orchestration de la transcription", () => {
  it("transcrit et enregistre le résultat", async () => {
    const deps = createDeps();

    expect(await runTranscription(deps, captureId)).toBe("transcribed");
    expect(deps.repository.saveResult).toHaveBeenCalledWith(
      captureId,
      expect.objectContaining({
        status: "ready",
        text: "Tension lombaire à droite.",
      }),
    );
  });

  it("amorce le modèle avec le nom de l'animal", async () => {
    const deps = createDeps();
    await runTranscription(deps, captureId);

    expect(deps.transcriber.transcribe).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: expect.stringContaining("Filou") }),
    );
  });

  /**
   * La rétention de vingt-quatre heures peut avoir purgé l'audio avant que la
   * tâche ne s'exécute. Ce n'est pas une panne : c'est le fonctionnement
   * nominal du produit, et il ne doit pas produire d'alerte.
   */
  it("s'arrête proprement si l'audio a été purgé", async () => {
    const deps = createDeps({
      objectStore: { getBytes: vi.fn(async () => null) },
    });

    expect(await runTranscription(deps, captureId)).toBe("audio_purged");
    expect(deps.repository.saveResult).not.toHaveBeenCalled();
  });

  it("n'exécute pas deux fois la même transcription", async () => {
    const deps = createDeps({
      repository: {
        ensure: vi.fn(async () => {}),
        markRunning: vi.fn(async () => false),
        saveResult: vi.fn(async () => {}),
        markFailed: vi.fn(async () => {}),
      },
    });

    expect(await runTranscription(deps, captureId)).toBe("already_running");
    expect(deps.objectStore.getBytes).not.toHaveBeenCalled();
  });

  it("enregistre inaudible plutôt qu'un texte inventé", async () => {
    const deps = createDeps({
      transcriber: { transcribe: vi.fn(async () => ({ text: "   " })) },
    });

    expect(await runTranscription(deps, captureId)).toBe("inaudible");
    expect(deps.repository.saveResult).toHaveBeenCalledWith(
      captureId,
      expect.objectContaining({ status: "inaudible", text: "" }),
    );
  });

  /**
   * Le code d'échec est normalisé. Le message du fournisseur peut contenir une
   * URL signée ou un identifiant de requête : il ne doit jamais être persisté.
   */
  it("normalise l'échec sans persister le message du fournisseur", async () => {
    const deps = createDeps({
      transcriber: {
        transcribe: vi.fn(async () => {
          throw new Error(
            "https://api.openai.com/... 429 rate limited req_abc",
          );
        }),
      },
    });

    expect(await runTranscription(deps, captureId)).toBe("failed");
    const [, code] = deps.repository.markFailed.mock.calls[0];
    expect(code).not.toContain("openai.com");
    expect(code).not.toContain("req_abc");
  });
});
