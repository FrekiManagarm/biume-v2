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
const beginAt = new Date("2026-08-17T09:00:00.000Z");

// Même formateur que le composant : les assertions restent une égalité
// stricte sans dépendre du fuseau horaire de la machine qui fait tourner les
// tests (`Intl.DateTimeFormat` sans fuseau explicite suit celui du runtime).
function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

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
        beginAt,
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
      screen.getByRole("button", { name: "Créer le compte rendu pour Oslo" }),
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
      screen.getByRole("button", { name: "Créer le compte rendu pour Oslo" }),
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

  test("la carte a un nom accessible qui distingue l'animal et l'heure", () => {
    // Sur une journée à dix rendez-vous, un lecteur d'écran qui navigue par
    // région ne peut s'appuyer que sur ce nom pour dire une carte d'une
    // autre : il doit porter l'animal, pas seulement l'heure.
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("article", {
        name: `Rendez-vous de Oslo à ${formatTime(beginAt)}`,
      }),
    ).toBeTruthy();
  });

  test("le bouton d'action porte le nom de l'animal dans son nom accessible, pas dans son texte visible", () => {
    // La navigation par liste de boutons (VoiceOver, NVDA) sort le bouton de
    // sa carte : sans désambiguïsation, dix cartes donneraient dix boutons
    // « Créer le compte rendu » indiscernables entre eux.
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Créer le compte rendu pour Oslo",
    });

    expect(button).toBeTruthy();
    // Le texte à l'écran reste inchangé : c'est le nom annoncé qui porte le
    // contexte, pas la surface visible.
    expect(button.textContent).toBe("Créer le compte rendu");
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
