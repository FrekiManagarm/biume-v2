import { describe, expect, test } from "vitest";

import type { AgendaAppointmentInput } from "./day-agenda";
import { buildDashboardOverviewModel } from "./dashboard-overview";

function appointment(
  overrides: Partial<AgendaAppointmentInput> = {},
): AgendaAppointmentInput {
  return {
    id: "appointment-1",
    beginAt: new Date("2026-07-02T09:00:00.000Z"),
    endAt: new Date("2026-07-02T10:00:00.000Z"),
    status: "CONFIRMED",
    atHome: true,
    note: "Séance de suivi locomoteur",
    reports: [],
    patient: {
      id: "animal-1",
      name: "Naska",
      breed: "Border Collie",
      animal: { name: "Chien", code: "dog" },
      owner: { id: "owner-1", name: "Malo Garnier" },
    },
    ...overrides,
  };
}

function formatLocalTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

describe("buildDashboardOverviewModel", () => {
  test("builds top summary, next appointment, priorities and recent activity", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [
        appointment({
          id: "sent",
          beginAt: new Date("2026-07-02T07:00:00.000Z"),
          endAt: new Date("2026-07-02T08:00:00.000Z"),
          status: "COMPLETED",
          reports: [{ id: "report-sent", status: "sent", updatedAt: null }],
        }),
        appointment({
          id: "next",
          beginAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
          status: "CONFIRMED",
        }),
        appointment({
          id: "draft",
          beginAt: new Date("2026-07-02T11:30:00.000Z"),
          endAt: new Date("2026-07-02T12:30:00.000Z"),
          status: "COMPLETED",
          reports: [{ id: "report-draft", status: "draft", updatedAt: null }],
        }),
      ],
      metrics: {
        newAnimals: 4,
        newOwners: 2,
        sentReports: 7,
      },
      recentActivity: [
        {
          id: "activity-1",
          title: "Compte rendu envoyé",
          description: "Naska",
          timestamp: "Il y a 2h",
        },
      ],
    });

    expect(model.heroLabel).toBe("Vue d'ensemble");
    expect(model.nextAppointment?.id).toBe("next");
    expect(model.summary.map((item) => [item.id, item.value])).toEqual([
      ["next", formatLocalTime(model.nextAppointment!.beginAt)],
      ["appointments", "3"],
      ["reports", "1"],
      ["activity", "7"],
    ]);
    expect(model.priorities.map((item) => item.appointmentId)).toEqual([
      "next",
      "draft",
    ]);
    expect(model.recentActivity[0]).toMatchObject({
      id: "activity-1",
      title: "Compte rendu envoyé",
    });
    expect(
      model.activitySignals.map((item) => [item.label, item.value]),
    ).toEqual([
      ["Animaux ajoutés", "4"],
      ["Propriétaires ajoutés", "2"],
      ["Comptes rendus envoyés", "7"],
    ]);
  });

  test("selects the current non-cancelled appointment as next appointment", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T09:30:00.000Z"),
      appointments: [
        appointment({
          id: "ongoing",
          beginAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
          status: "CONFIRMED",
        }),
        appointment({
          id: "cancelled-future",
          beginAt: new Date("2026-07-02T10:30:00.000Z"),
          endAt: new Date("2026-07-02T11:30:00.000Z"),
          status: "CANCELLED",
        }),
        appointment({
          id: "later-confirmed",
          beginAt: new Date("2026-07-02T12:00:00.000Z"),
          endAt: new Date("2026-07-02T13:00:00.000Z"),
          status: "CONFIRMED",
        }),
      ],
      metrics: {
        newAnimals: 0,
        newOwners: 0,
        sentReports: 0,
      },
      recentActivity: [],
    });

    expect(model.nextAppointment?.id).toBe("ongoing");
  });

  test("ignores a cancelled future appointment when selecting the next appointment", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [
        appointment({
          id: "cancelled-future",
          beginAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
          status: "CANCELLED",
        }),
        appointment({
          id: "later-confirmed",
          beginAt: new Date("2026-07-02T10:30:00.000Z"),
          endAt: new Date("2026-07-02T11:30:00.000Z"),
          status: "CONFIRMED",
        }),
      ],
      metrics: {
        newAnimals: 0,
        newOwners: 0,
        sentReports: 0,
      },
      recentActivity: [],
    });

    expect(model.nextAppointment?.id).toBe("later-confirmed");
  });

  test("returns calm empty states when the day has no appointments or priorities", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [],
      metrics: {
        newAnimals: 0,
        newOwners: 0,
        sentReports: 0,
      },
      recentActivity: [],
    });

    expect(model.nextAppointment).toBeNull();
    expect(model.priorities).toEqual([]);
    expect(model.emptyStates).toEqual({
      agenda: "Aucune séance prévue aujourd'hui.",
      priorities: "Rien d'urgent à traiter.",
      recentActivity: "Aucune activité récente à afficher.",
    });
  });

  test("normalizes legacy activity vocabulary for the overview", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [],
      metrics: {
        newAnimals: 0,
        newOwners: 0,
        sentReports: 0,
      },
      recentActivity: [
        {
          id: "report-activity",
          title: "Rapport envoyé",
          description: "Rapport de suivi",
          timestamp: "Il y a 2h",
        },
        {
          id: "animal-activity",
          type: "new_patient",
          title: "Nouveau patient",
          description: "Patient ajouté",
          timestamp: "Hier",
        },
      ],
    });

    expect(model.recentActivity).toEqual([
      {
        id: "report-activity",
        title: "Compte rendu envoyé",
        description: "Compte rendu de suivi",
        timestamp: "Il y a 2h",
      },
      {
        id: "animal-activity",
        type: "new_patient",
        title: "Nouvel animal",
        description: "Animal ajouté",
        timestamp: "Hier",
      },
    ]);
  });
});
