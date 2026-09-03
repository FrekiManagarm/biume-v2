import { describe, expect, test } from "vitest";

import {
  buildDayAgendaModel,
  deriveAgendaReportState,
  getAgendaPrimaryAction,
  type AgendaAppointmentInput,
  type AgendaReportInput,
} from "./day-agenda";

function appointment(
  overrides: Partial<AgendaAppointmentInput> = {},
): AgendaAppointmentInput {
  return {
    id: "appointment-1",
    beginAt: new Date("2026-07-01T09:00:00.000Z"),
    endAt: new Date("2026-07-01T10:00:00.000Z"),
    status: "CONFIRMED",
    reports: [],
    patient: {
      id: "animal-1",
      name: "Oslo",
      breed: "Berger australien",
      animal: { name: "Chien", code: "dog" },
      owner: { id: "owner-1", name: "Camille Martin" },
    },
    ...overrides,
  };
}

function report(
  overrides: Partial<AgendaReportInput> = {},
): AgendaReportInput {
  return {
    id: "report-1",
    status: "draft",
    updatedAt: null,
    consultationReason: "",
    notes: null,
    anatomicalIssueCount: 0,
    recommendationCount: 0,
    ...overrides,
  };
}

describe("deriveAgendaReportState", () => {
  test("aucun compte rendu", () => {
    expect(deriveAgendaReportState([])).toBe("absent");
  });

  test("un brouillon sans aucune saisie est vide", () => {
    expect(deriveAgendaReportState([report()])).toBe("empty");
  });

  test("un brouillon avec un motif est commencé", () => {
    expect(
      deriveAgendaReportState([report({ consultationReason: "Boiterie" })]),
    ).toBe("started");
  });

  test("un compte rendu finalisé", () => {
    expect(deriveAgendaReportState([report({ status: "finalized" })])).toBe(
      "finalized",
    );
  });

  test("un compte rendu envoyé", () => {
    expect(deriveAgendaReportState([report({ status: "sent" })])).toBe("sent");
  });

  test("le compte rendu le plus récent l'emporte", () => {
    expect(
      deriveAgendaReportState([
        report({
          id: "ancien",
          status: "draft",
          updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        }),
        report({
          id: "recent",
          status: "sent",
          updatedAt: new Date("2026-08-10T10:00:00.000Z"),
        }),
      ]),
    ).toBe("sent");
  });
});

describe("getAgendaPrimaryAction", () => {
  test("une séance annulée ne propose aucune action", () => {
    expect(getAgendaPrimaryAction("cancelled", "started")).toEqual({
      kind: "cancelled",
      label: "Annulé",
    });
  });

  test("avant la séance, sans compte rendu, on propose de le préparer", () => {
    expect(getAgendaPrimaryAction("scheduled", "absent")).toEqual({
      kind: "prepare_report",
      label: "Préparer le compte rendu",
    });
  });

  test("avant la séance, un compte rendu préparé s'ouvre depuis la carte", () => {
    expect(getAgendaPrimaryAction("scheduled", "empty")).toEqual({
      kind: "open_report",
      label: "Ouvrir le compte rendu",
    });
  });

  test("avant la séance, un brouillon commencé se continue", () => {
    expect(getAgendaPrimaryAction("scheduled", "started")).toEqual({
      kind: "continue_report",
      label: "Continuer le compte rendu",
    });
  });

  test("après la séance, sans compte rendu, on le crée", () => {
    expect(getAgendaPrimaryAction("done", "absent")).toEqual({
      kind: "create_report",
      label: "Créer le compte rendu",
    });
  });

  test("après la séance, un brouillon vide est à remplir", () => {
    expect(getAgendaPrimaryAction("done", "empty")).toEqual({
      kind: "fill_report",
      label: "Remplir le compte rendu",
    });
  });

  test("après la séance, un compte rendu finalisé est à envoyer", () => {
    expect(getAgendaPrimaryAction("done", "finalized")).toEqual({
      kind: "send_report",
      label: "Envoyer au propriétaire",
    });
  });

  test("un compte rendu envoyé se consulte", () => {
    expect(getAgendaPrimaryAction("done", "sent")).toEqual({
      kind: "view_report",
      label: "Voir le compte rendu",
    });
  });
});

describe("buildDayAgendaModel", () => {
  test("exposes duration and report target metadata for overview actions", () => {
    const model = buildDayAgendaModel({
      now: new Date("2026-07-01T12:00:00.000Z"),
      selectedDate: new Date("2026-07-01T00:00:00.000Z"),
      appointments: [
        appointment({
          id: "draft-appointment",
          beginAt: new Date("2026-07-01T13:30:00.000Z"),
          endAt: new Date("2026-07-01T14:15:00.000Z"),
          status: "COMPLETED",
          reports: [
            report({
              id: "draft-report",
              status: "draft",
              updatedAt: new Date("2026-07-01T11:00:00.000Z"),
              consultationReason: "Boiterie",
            }),
          ],
        }),
      ],
    });

    expect(model.appointments[0]?.durationLabel).toBe("45 min");
    expect(model.appointments[0]?.primaryAction).toMatchObject({
      kind: "continue_report",
      label: "Continuer le compte rendu",
      reportId: "draft-report",
      appointmentId: "draft-appointment",
    });
    expect(model.todo.afterSession[0]?.action).toMatchObject({
      reportId: "draft-report",
      appointmentId: "draft-appointment",
    });
  });

  test("sorts appointments and separates before and after session actions", () => {
    const model = buildDayAgendaModel({
      now: new Date("2026-07-01T10:15:00.000Z"),
      selectedDate: new Date("2026-07-01T00:00:00.000Z"),
      appointments: [
        appointment({
          id: "late",
          beginAt: new Date("2026-07-01T17:00:00.000Z"),
          endAt: new Date("2026-07-01T18:00:00.000Z"),
          status: "COMPLETED",
          reports: [report({ id: "report-2", status: "draft", updatedAt: null })],
        }),
        appointment({
          id: "next",
          beginAt: new Date("2026-07-01T10:30:00.000Z"),
          endAt: new Date("2026-07-01T11:30:00.000Z"),
          status: "CONFIRMED",
        }),
        appointment({
          id: "done",
          beginAt: new Date("2026-07-01T09:00:00.000Z"),
          endAt: new Date("2026-07-01T10:00:00.000Z"),
          status: "COMPLETED",
        }),
      ],
    });

    expect(model.appointments.map((item) => item.id)).toEqual([
      "done",
      "next",
      "late",
    ]);
    expect(model.todo.beforeSession.map((item) => item.appointmentId)).toEqual([
      "next",
    ]);
    expect(model.todo.afterSession.map((item) => item.appointmentId)).toEqual([
      "done",
      "late",
    ]);
    expect(model.summary).toEqual({
      appointmentCount: 3,
      beforeSessionCount: 1,
      afterSessionCount: 2,
    });
  });

  test("keeps only appointments on the selected day", () => {
    const model = buildDayAgendaModel({
      now: new Date(2026, 6, 1, 8, 15),
      selectedDate: new Date(2026, 6, 1, 0, 0),
      appointments: [
        appointment({
          id: "previous-day",
          beginAt: new Date(2026, 5, 30, 17, 0),
          endAt: new Date(2026, 5, 30, 18, 0),
          status: "COMPLETED",
        }),
        appointment({
          id: "selected-day-late",
          beginAt: new Date(2026, 6, 1, 17, 0),
          endAt: new Date(2026, 6, 1, 18, 0),
          status: "COMPLETED",
          reports: [report({ id: "report-2", status: "draft", updatedAt: null })],
        }),
        appointment({
          id: "selected-day-early",
          beginAt: new Date(2026, 6, 1, 9, 0),
          endAt: new Date(2026, 6, 1, 10, 0),
          status: "CONFIRMED",
        }),
        appointment({
          id: "next-day",
          beginAt: new Date(2026, 6, 2, 9, 0),
          endAt: new Date(2026, 6, 2, 10, 0),
          status: "CONFIRMED",
        }),
      ],
    });

    expect(model.appointments.map((item) => item.id)).toEqual([
      "selected-day-early",
      "selected-day-late",
    ]);
    expect(model.todo.beforeSession.map((item) => item.appointmentId)).toEqual([
      "selected-day-early",
    ]);
    expect(model.todo.afterSession.map((item) => item.appointmentId)).toEqual([
      "selected-day-late",
    ]);
    expect(model.summary).toEqual({
      appointmentCount: 2,
      beforeSessionCount: 1,
      afterSessionCount: 1,
    });
  });
});
