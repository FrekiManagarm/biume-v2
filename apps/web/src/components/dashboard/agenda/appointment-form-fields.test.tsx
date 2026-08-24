// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import type { ConflictCandidate } from "#/lib/dashboard/appointment-conflicts";

import { AppointmentFormFields } from "./appointment-form-fields";

afterEach(cleanup);

const day = new Date(2026, 7, 21);

const existing: ConflictCandidate[] = [
  {
    id: "rdv-1",
    beginAt: new Date(2026, 7, 21, 9, 30),
    endAt: new Date(2026, 7, 21, 10, 30),
    status: "CONFIRMED",
    patientName: "Filou",
  },
];

describe("AppointmentFormFields", () => {
  test("ne signale rien quand aucun rendez-vous n'existe", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();
  });

  test("signale le chevauchement des horaires par défaut", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
        existingAppointments={existing}
      />,
    );

    expect(screen.getByRole("status").textContent).toBe(
      "Ce créneau chevauche la séance de Filou à 09:30.",
    );
  });

  test("ne se signale pas lui-même quand on déplace un rendez-vous", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:30"
        defaultEndTime="10:30"
        existingAppointments={existing}
        excludeAppointmentId="rdv-1"
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();
  });

  test("conserve le nom des champs pour la soumission par FormData", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
      />,
    );

    expect(screen.getByLabelText("Date").getAttribute("name")).toBe("date");
    expect(screen.getByLabelText("Début").getAttribute("name")).toBe(
      "startTime",
    );
    expect(screen.getByLabelText("Fin").getAttribute("name")).toBe("endTime");
  });
});
