// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  buildDayAgendaModel,
  type AgendaReportInput,
} from "#/lib/dashboard/day-agenda";

import { AppointmentCard } from "./appointment-card";

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

afterEach(cleanup);

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

  test("une séance à venir se lit « Prévu » et ne propose pas de bouton", () => {
    // Adaptation documentée (voir task-10-brief.md, remarque sous l'étape 1) :
    // avec `reports: []`, l'absence de compte rendu produit `prepare_report`
    // ("Préparer le compte rendu"), pas `upcoming` — l'intention du plan est
    // de vérifier l'état "rien ne presse avant la séance", donc on fournit un
    // brouillon de compte rendu vide (déjà préparé, rien à afficher comme
    // urgent) pour obtenir `upcoming`.
    render(
      <AppointmentCard
        appointment={cardFor({
          endAt: new Date("2026-08-17T18:00:00.000Z"),
          reports: [
            {
              id: "report-1",
              status: "draft",
              updatedAt: new Date("2026-08-17T08:00:00.000Z"),
              consultationReason: "",
              notes: null,
              anatomicalIssueCount: 0,
              recommendationCount: 0,
            },
          ],
        })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Prévu")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /compte rendu/i }),
    ).toBeNull();
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

  test("l'action principale se désactive pendant qu'elle est en vol", () => {
    // Garde-fou anti double-clic : tant que la mutation déclenchée par le
    // clic précédent n'a pas abouti, le bouton reste désactivé pour éviter
    // de créer deux comptes rendus pour le même rendez-vous.
    const onPrimaryAction = vi.fn();
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        isPrimaryActionPending
        onPrimaryAction={onPrimaryAction}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Créer le compte rendu",
    });
    expect(button.hasAttribute("disabled")).toBe(true);
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
