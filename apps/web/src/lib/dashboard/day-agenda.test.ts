import { describe, expect, test } from "vitest";

import {
  buildDayAgendaModel,
  deriveAgendaReportStatus,
  getAgendaPrimaryAction,
  type AgendaAppointmentInput,
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

describe("deriveAgendaReportStatus", () => {
  test("returns none before a completed session when no report exists", () => {
    expect(deriveAgendaReportStatus([], "CONFIRMED")).toBe("none");
  });

  test("returns to_create after a completed session when no report exists", () => {
    expect(deriveAgendaReportStatus([], "COMPLETED")).toBe("to_create");
  });

  test("returns draft for a draft report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "draft", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("draft");
  });

  test("returns ready_to_send for a finalized report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "finalized", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("ready_to_send");
  });

  test("returns sent for a sent report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "sent", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("sent");
  });

  test("returns the latest report status by updatedAt", () => {
    expect(
      deriveAgendaReportStatus(
        [
          {
            id: "report-1",
            status: "sent",
            updatedAt: new Date("2026-07-01T08:00:00.000Z"),
          },
          {
            id: "report-2",
            status: "draft",
            updatedAt: new Date("2026-07-01T09:00:00.000Z"),
          },
        ],
        "COMPLETED",
      ),
    ).toBe("draft");
  });
});

describe("getAgendaPrimaryAction", () => {
  test("uses Prepare before a report exists on a future/current session", () => {
    expect(getAgendaPrimaryAction("none", "CONFIRMED")).toMatchObject({
      kind: "prepare",
      label: "Préparer",
    });
  });

  test("uses Create report after completed session without report", () => {
    expect(getAgendaPrimaryAction("to_create", "COMPLETED")).toMatchObject({
      kind: "create_report",
      label: "Créer le compte rendu",
    });
  });

  test("uses Finalize for draft reports", () => {
    expect(getAgendaPrimaryAction("draft", "COMPLETED")).toMatchObject({
      kind: "finalize_report",
      label: "Finaliser",
    });
  });

  test("uses Send for finalized reports", () => {
    expect(getAgendaPrimaryAction("ready_to_send", "COMPLETED")).toMatchObject({
      kind: "send_report",
      label: "Envoyer",
    });
  });

  test("does not imply a report for a cancelled appointment without report", () => {
    expect(getAgendaPrimaryAction("none", "CANCELLED")).toMatchObject({
      kind: "prepare",
      label: "Préparer",
    });
  });
});

describe("buildDayAgendaModel", () => {
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
          reports: [{ id: "report-2", status: "draft", updatedAt: null }],
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
          reports: [{ id: "report-2", status: "draft", updatedAt: null }],
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
