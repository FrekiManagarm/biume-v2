import { describe, expect, it } from "vitest";
import { classifyTodo, type TodoSource } from "./todo.service";

const resolved = { clinical: "confirmed", anatomical: "not_applicable", recommendations: "confirmed", notes: "not_applicable" } as const;
const pending = { ...resolved, clinical: "proposed" } as const;

function source(overrides: Partial<TodoSource> = {}): TodoSource {
  return {
    reportId: "report-1",
    reportStatus: "draft",
    transcriptStatus: "ready",
    proposalCount: 0,
    sectionStates: null,
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
