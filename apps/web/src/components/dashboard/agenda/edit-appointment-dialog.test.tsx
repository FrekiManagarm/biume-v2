// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";
import {
  EditAppointmentDialog,
  type EditAppointmentDialogProps,
} from "./edit-appointment-dialog";

type OnSubmit = EditAppointmentDialogProps["onSubmit"];

/**
 * jsdom n'implémente pas ResizeObserver, que le `Switch` Radix utilise pour
 * mesurer son curseur — même contournement que `new-appointment-dialog.test.tsx`.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const appointment: DayAgendaAppointment = {
  id: "appointment-1",
  beginAt: new Date("2026-08-17T09:00:00"),
  endAt: new Date("2026-08-17T10:00:00"),
  status: "CREATED",
  atHome: false,
  note: "Boiterie légère",
  reports: [],
  durationLabel: "1 h",
  sessionState: "scheduled",
  reportState: "absent",
  primaryAction: {
    kind: "prepare_report",
    label: "Préparer le compte rendu",
  },
  patient: {
    id: "patient-1",
    name: "Nox",
    animal: { name: "Nox" },
    owner: { id: "owner-1", name: "Camille" },
  },
};

function renderDialog(onSubmit: OnSubmit, onOpenChange = vi.fn()) {
  render(
    <EditAppointmentDialog
      appointment={appointment}
      isSubmitting={false}
      open
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />,
  );

  return { onOpenChange };
}

describe("EditAppointmentDialog", () => {
  afterEach(cleanup);

  it("pré-remplit les champs à partir du rendez-vous fourni", () => {
    renderDialog(vi.fn());

    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe(
      "2026-08-17",
    );
    expect((screen.getByLabelText("Début") as HTMLInputElement).value).toBe(
      "09:00",
    );
    expect((screen.getByLabelText("Fin") as HTMLInputElement).value).toBe(
      "10:00",
    );
    expect((screen.getByLabelText("Note") as HTMLTextAreaElement).value).toBe(
      "Boiterie légère",
    );
  });

  it("transmet les valeurs modifiées, avec l'identifiant du rendez-vous d'origine", async () => {
    const onSubmit = vi.fn<OnSubmit>().mockResolvedValue(undefined);
    renderDialog(onSubmit);

    fireEvent.change(screen.getByLabelText("Début"), {
      target: { value: "11:00" },
    });
    fireEvent.click(screen.getByLabelText("Rendez-vous à domicile"));
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onSubmit).toHaveBeenCalledWith({
      appointmentId: "appointment-1",
      atHome: true,
      beginAt: new Date("2026-08-17T11:00:00"),
      endAt: new Date("2026-08-17T10:00:00"),
      note: "Boiterie légère",
    });

    // Comme `NewAppointmentDialog`, `handleSubmit` continue après cet
    // `await` : on laisse cette suite se terminer avant que `cleanup()` ne
    // démonte le composant.
    await onSubmit.mock.results[0]?.value;
  });

  it("appelle « Fermer », jamais « Annuler », pour ne pas se confondre avec « Annuler la séance » du menu d'actions", () => {
    renderDialog(vi.fn());

    expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Annuler" })).toBeNull();
  });

  it("reste ouvert quand l'enregistrement échoue", async () => {
    // La fermeture du dialogue est ce que le praticien lit comme un succès :
    // se refermer sur un échec réseau le ferait repartir avec un rendez-vous
    // qu'il croit déplacé et qui ne l'est pas, le message d'erreur ayant filé
    // pendant qu'il regardait ailleurs.
    const onSubmit = vi.fn<OnSubmit>().mockRejectedValue(new Error("réseau"));
    const { onOpenChange } = renderDialog(onSubmit);

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeTruthy();
  });

  it("ne rend aucun formulaire tant qu'aucun rendez-vous n'est fourni", () => {
    render(
      <EditAppointmentDialog
        appointment={null}
        isSubmitting={false}
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Enregistrer" })).toBeNull();
  });
});
