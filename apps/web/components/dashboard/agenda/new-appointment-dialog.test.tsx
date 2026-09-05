// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { NewAppointmentDialog } from "./new-appointment-dialog";

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(cleanup);

const patients = [{ id: "pet-1", name: "Nitro" }];

function renderDialog(onCreateAppointment = vi.fn()) {
  render(
    <NewAppointmentDialog
      isSubmitting={false}
      open
      patients={patients}
      selectedDate={new Date(2026, 7, 21)}
      existingAppointments={[]}
      onCreateAppointment={onCreateAppointment}
      onOpenChange={() => {}}
    />,
  );
  return onCreateAppointment;
}

function submit(patientValue = "pet-1") {
  fireEvent.change(screen.getByLabelText("Patient"), {
    target: { value: patientValue },
  });
  fireEvent.submit(document.querySelector("form")!);
}

describe("NewAppointmentDialog", () => {
  test("demande le compte rendu quand l'interrupteur reste coché", async () => {
    const onCreateAppointment = renderDialog();
    submit();
    await vi.waitFor(() => expect(onCreateAppointment).toHaveBeenCalled());
    expect(onCreateAppointment.mock.calls[0][0]).toMatchObject({
      patientId: "pet-1",
      withReport: true,
    });
  });

  test("ne demande pas de compte rendu quand l'interrupteur est décoché", async () => {
    const onCreateAppointment = renderDialog();
    fireEvent.click(
      screen.getByLabelText(/Préparer le compte rendu de cette séance/),
    );
    submit();
    await vi.waitFor(() => expect(onCreateAppointment).toHaveBeenCalled());
    expect(onCreateAppointment.mock.calls[0][0]).toMatchObject({
      withReport: false,
    });
  });
});
