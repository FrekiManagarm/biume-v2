// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { NewAppointmentDialog } from "#/components/dashboard/agenda/new-appointment-dialog";

vi.mock("@tanstack/react-query", () => ({
  queryOptions: (options: Record<string, unknown>) => options,
  useMutation: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
  useSuspenseQuery: vi.fn(
    (options: { queryKey?: readonly unknown[] } | undefined) => {
      if (options?.queryKey?.[0] === "patients") {
        return {
          data: [
            {
              id: "patient-1",
              name: "Naska",
              owner: { name: "Malo Garnier" },
              animal: { name: "Chien" },
            },
          ],
        };
      }

      return { data: [] };
    },
  ),
}));

vi.mock("#/lib/api/actions/appointments.action", () => ({
  createAppointment: vi.fn(),
  getAppointments: vi.fn(),
}));

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
});

describe("NewAppointmentDialog", () => {
  test("renders the appointment creation form with available patients", () => {
    render(
      <NewAppointmentDialog
        isSubmitting={false}
        open
        patients={[
          {
            id: "patient-1",
            name: "Naska",
            owner: { name: "Malo Garnier" },
            animal: { name: "Chien" },
          },
        ]}
        selectedDate={new Date(2026, 6, 2)}
        onCreateAppointment={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Créer un rendez-vous" }),
    ).toBeTruthy();
    expect(screen.getByRole("option", { name: /Naska/ })).toBeTruthy();
    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe(
      "2026-07-02",
    );
  });
});
