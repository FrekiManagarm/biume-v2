// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NewAppointmentDialog,
  type NewAppointmentDialogProps,
} from "./new-appointment-dialog";

type OnCreateAppointment = NewAppointmentDialogProps["onCreateAppointment"];

/**
 * jsdom n'implémente pas ResizeObserver, que le `Switch` Radix utilise pour
 * mesurer son curseur. Aucun test existant ne montait encore ce composant :
 * on fournit ici une implémentation minimale plutôt que d'ajouter une
 * dépendance ou un setup global.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const patients = [
  {
    id: "patient-1",
    name: "Nox",
    owner: { name: "Camille" },
    animal: { name: "Nox" },
  },
];

function renderDialog(
  onCreateAppointment: OnCreateAppointment,
  onOpenChange = vi.fn(),
) {
  render(
    <NewAppointmentDialog
      isSubmitting={false}
      open
      patients={patients}
      selectedDate={new Date("2026-08-17T00:00:00.000Z")}
      onCreateAppointment={onCreateAppointment}
      onOpenChange={onOpenChange}
    />,
  );

  // Le patient est le seul champ requis sans valeur par défaut.
  fireEvent.change(screen.getByLabelText("Patient"), {
    target: { value: "patient-1" },
  });

  return { onOpenChange };
}

describe("NewAppointmentDialog", () => {
  // Aucune configuration globale n'active le nettoyage automatique de
  // Testing Library dans ce dépôt (pas de `globals: true`) : sans cet appel,
  // le rendu du test précédent reste dans le document et fausse les
  // requêtes `screen` du test suivant.
  afterEach(cleanup);

  it("propose de préparer le compte rendu par défaut", async () => {
    const onCreateAppointment = vi
      .fn<OnCreateAppointment>()
      .mockResolvedValue(undefined);
    renderDialog(onCreateAppointment);

    fireEvent.click(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    );

    expect(onCreateAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ withReport: true }),
    );

    // `handleSubmit` continue après ce `await` (fermeture puis reset du
    // formulaire) : on laisse cette suite se terminer avant que `cleanup()`
    // ne démonte le composant, pour ne pas laisser de mise à jour React en
    // suspens entre deux tests.
    await onCreateAppointment.mock.results[0]?.value;
  });

  it("n'envoie pas la préparation du compte rendu quand le praticien décoche la case", async () => {
    const onCreateAppointment = vi
      .fn<OnCreateAppointment>()
      .mockResolvedValue(undefined);
    renderDialog(onCreateAppointment);

    fireEvent.click(
      screen.getByLabelText("Préparer le compte rendu de cette séance"),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    );

    expect(onCreateAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ withReport: false }),
    );

    await onCreateAppointment.mock.results[0]?.value;
  });

  it("reste ouvert quand la création échoue", async () => {
    // Même règle que `EditAppointmentDialog` : refermer le dialogue est ce qui
    // dit « c'est créé ». Un échec réseau doit laisser le formulaire, et sa
    // saisie, à l'écran.
    const onCreateAppointment = vi
      .fn<OnCreateAppointment>()
      .mockRejectedValue(new Error("réseau"));
    const { onOpenChange } = renderDialog(onCreateAppointment);

    fireEvent.click(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    );

    await waitFor(() => {
      expect(onCreateAppointment).toHaveBeenCalledTimes(1);
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    ).toBeTruthy();
  });
});
