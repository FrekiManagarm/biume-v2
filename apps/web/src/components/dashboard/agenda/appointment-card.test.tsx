// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  buildDayAgendaModel,
  type AgendaReportInput,
} from "#/lib/dashboard/day-agenda";

import { AppointmentCard } from "./appointment-card";

afterEach(() => {
  cleanup();
});

const now = new Date("2026-08-17T14:00:00.000Z");

function cardFor(overrides: {
  endAt: Date;
  status?: "CREATED" | "CANCELLED";
  reports?: AgendaReportInput[];
}) {
  const model = buildDayAgendaModel({
    now,
    selectedDate: now,
    appointments: [
      {
        id: "appointment-1",
        beginAt: new Date("2026-08-17T09:00:00.000Z"),
        endAt: overrides.endAt,
        status: overrides.status ?? "CREATED",
        reports: overrides.reports ?? [],
        patient: {
          id: "animal-1",
          name: "Oslo",
          animal: { name: "Chien", code: "dog" },
          owner: { id: "owner-1", name: "Camille Martin" },
        },
      },
    ],
  });

  return model.appointments[0]!;
}

describe("AppointmentCard", () => {
  test("une séance passée sans compte rendu propose de le créer", () => {
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Créer le compte rendu" }),
    ).toBeTruthy();
    expect(screen.getByText("Terminé")).toBeTruthy();
  });

  test("le clic sur le bouton d'action déclenche onPrimaryAction avec le rendez-vous", () => {
    const onPrimaryAction = vi.fn();
    const appointment = cardFor({
      endAt: new Date("2026-08-17T10:00:00.000Z"),
    });

    render(
      <AppointmentCard
        appointment={appointment}
        onPrimaryAction={onPrimaryAction}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Créer le compte rendu" }),
    );

    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onPrimaryAction).toHaveBeenCalledWith(appointment);
  });

  test("une séance à venir se lit « Prévu » et ne propose pas de bouton", () => {
    // Un rendez-vous réel créé à l'avance porte déjà un brouillon de compte
    // rendu vide (créé en même temps que lui). Tant que ce brouillon est vide,
    // `reportState` vaut "empty" et non "absent" : rien ne presse avant la
    // séance, donc aucune action n'est proposée — cf. la table de vérité du
    // brief. Avec `reports: []` (absence totale de compte rendu), l'action
    // deviendrait "Préparer le compte rendu", ce que ce test ne veut pas
    // exercer ici.
    const emptyDraft: AgendaReportInput = {
      id: "report-1",
      status: "draft",
      updatedAt: new Date("2026-08-17T08:00:00.000Z"),
      consultationReason: "",
      notes: null,
      anatomicalIssueCount: 0,
      recommendationCount: 0,
    };

    render(
      <AppointmentCard
        appointment={cardFor({
          endAt: new Date("2026-08-17T18:00:00.000Z"),
          reports: [emptyDraft],
        })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Prévu")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("une séance annulée n'expose aucune action", () => {
    render(
      <AppointmentCard
        appointment={cardFor({
          endAt: new Date("2026-08-17T10:00:00.000Z"),
          status: "CANCELLED",
        })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Annulé")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("le nom de l'animal et du propriétaire sont lisibles", () => {
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Oslo")).toBeTruthy();
    expect(screen.getByText(/Camille Martin/)).toBeTruthy();
  });
});
