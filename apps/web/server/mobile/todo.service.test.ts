import { describe, expect, it } from "vitest";
import { classifyTodo, todoCaptureStatuses, type TodoSource } from "./todo.service";

const resolved = { clinical: "confirmed", anatomical: "not_applicable", recommendations: "confirmed", notes: "not_applicable" } as const;
const pending = { ...resolved, clinical: "proposed" } as const;

function source(overrides: Partial<TodoSource> = {}): TodoSource {
  return {
    reportId: "report-1",
    reportStatus: "draft",
    transcriptStatus: "ready",
    proposalCount: 0,
    sectionStates: null,
    audioExpired: false,
    hasPatient: false,
    ...overrides,
  };
}

describe("classement d'une dictée", () => {
  it("exclut un rapport finalisé ou envoyé", () => {
    expect(classifyTodo(source({ reportStatus: "finalized" }))).toBeNull();
    expect(classifyTodo(source({ reportStatus: "sent" }))).toBeNull();
  });
  it("signale une dictée inaudible avant tout le reste", () => {
    expect(classifyTodo(source({ reportId: null, transcriptStatus: "inaudible" }))).toBe("inaudible");
  });
  it("demande le rattachement d'une capture sans rapport", () => {
    expect(classifyTodo(source({ reportId: null, reportStatus: null, transcriptStatus: "running" }))).toBe("to_attach");
  });
  it("attend une transcription en cours", () => {
    expect(classifyTodo(source({ transcriptStatus: "pending" }))).toBe("transcribing");
    expect(classifyTodo(source({ transcriptStatus: null }))).toBe("transcribing");
  });
  it("propose de relire une transcription sans proposition", () => {
    expect(classifyTodo(source({ transcriptStatus: "corrected" }))).toBe("transcript_to_review");
  });
  it("demande de valider tant qu'une section reste à vérifier", () => {
    expect(classifyTodo(source({ proposalCount: 3, sectionStates: pending }))).toBe("report_to_validate");
  });
  it("dit prêt à envoyer quand tout est décidé", () => {
    expect(classifyTodo(source({ proposalCount: 3, sectionStates: resolved }))).toBe("ready_to_send");
  });
});

describe("dictée dont l'audio a expiré", () => {
  it("reste listée : la transcription et le rapport, eux, existent toujours", () => {
    expect(
      classifyTodo(source({ audioExpired: true, transcriptStatus: "ready", proposalCount: 0 })),
    ).toBe("transcript_to_review");
    expect(
      classifyTodo(
        source({ audioExpired: true, transcriptStatus: "corrected", proposalCount: 3, sectionStates: pending }),
      ),
    ).toBe("report_to_validate");
    expect(
      classifyTodo(
        source({ audioExpired: true, transcriptStatus: "corrected", proposalCount: 3, sectionStates: resolved }),
      ),
    ).toBe("ready_to_send");
  });

  it("sort de la liste quand rien n'a jamais été transcrit", () => {
    expect(
      classifyTodo(source({ audioExpired: true, transcriptStatus: null, reportId: null, reportStatus: null })),
    ).toBeNull();
  });

  it("est retenue par la requête au même titre qu'une dictée envoyée", () => {
    expect([...todoCaptureStatuses].sort()).toEqual(["expired", "uploaded"]);
  });
});

describe("capture dont l'animal est déjà connu", () => {
  /// Une capture née d'un rendez-vous porte déjà son animal. Si le rendez-vous
  /// n'a pas de rapport, elle n'a pas de `reportId` pour autant — et demander
  /// de la rattacher créerait un second rapport, détaché du rendez-vous.
  it("ne demande pas de rattacher un animal déjà connu", () => {
    expect(
      classifyTodo(
        source({ reportId: null, reportStatus: null, hasPatient: true, transcriptStatus: "ready" }),
      ),
    ).toBe("transcript_to_review");
    expect(
      classifyTodo(
        source({ reportId: null, reportStatus: null, hasPatient: true, transcriptStatus: "running" }),
      ),
    ).toBe("transcribing");
  });

  it("demande encore le rattachement d'une capture libre", () => {
    expect(
      classifyTodo(source({ reportId: null, reportStatus: null, transcriptStatus: "ready" })),
    ).toBe("to_attach");
  });
});
