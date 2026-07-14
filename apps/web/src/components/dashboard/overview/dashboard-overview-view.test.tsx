// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { DashboardOverviewView } from "./dashboard-overview-view";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    params,
    to,
    ...props
  }: {
    children: ReactNode;
    params?: Record<string, string>;
    to: string;
  }) => (
    <a href={params?.id ? to.replace("$id", params.id) : to} {...props}>
      {children}
    </a>
  ),
}));

describe("DashboardOverviewView", () => {
  test("renders a compact overview with agenda, priorities, and activity", () => {
    const selectedDate = new Date(2026, 6, 2, 0, 0);

    render(
      <DashboardOverviewView
        selectedDate={selectedDate}
        now={new Date(2026, 6, 2, 12, 0)}
        metrics={{
          newAnimals: 4,
          newOwners: 2,
          sentReports: 7,
        }}
        appointments={[
          {
            id: "appointment-upcoming",
            beginAt: new Date(2026, 6, 2, 14, 0),
            endAt: new Date(2026, 6, 2, 15, 0),
            status: "CONFIRMED",
            atHome: true,
            note: "Suivi locomoteur",
            patient: {
              id: "patient-1",
              name: "Naska",
              breed: "Border Collie",
              animal: { name: "Chien" },
              owner: { id: "owner-1", name: "Malo Garnier" },
            },
          },
          {
            id: "appointment-draft",
            beginAt: new Date(2026, 6, 2, 10, 0),
            endAt: new Date(2026, 6, 2, 11, 0),
            status: "COMPLETED",
            atHome: false,
            reports: [{ id: "report-1", status: "draft", updatedAt: null }],
            patient: {
              id: "patient-2",
              name: "Orka",
              owner: { id: "owner-2", name: "Lina Moreau" },
            },
          },
          {
            id: "appointment-cancelled",
            beginAt: new Date(2026, 6, 2, 16, 0),
            endAt: new Date(2026, 6, 2, 17, 0),
            status: "CANCELLED",
            atHome: true,
            patient: {
              id: "patient-3",
              name: "Moka",
              owner: { id: "owner-3", name: "Noé Bernard" },
            },
          },
        ]}
        recentActivity={[
          {
            id: "activity-1",
            title: "Rapport envoyé",
            description: "Naska · Malo Garnier",
            timestamp: "Il y a 2h",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Indicateurs du tableau de bord",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Agenda du jour")).toBeTruthy();
    expect(screen.getAllByText("Naska").length).toBeGreaterThan(0);
    expect(screen.getAllByText("À domicile").length).toBeGreaterThan(0);
    expect(screen.getByText("Chien · Border Collie")).toBeTruthy();
    expect(screen.getByText("Suivi locomoteur")).toBeTruthy();
    expect(screen.getByText("À traiter")).toBeTruthy();
    expect(screen.getByText("Finaliser · Orka")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Ouvrir l'agenda/ })).toBeTruthy();
    expect(screen.getAllByText("Préparer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Finaliser").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Préparer" })).toBeNull();
    expect(screen.getAllByText("Annulée").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Annulée" })).toBeNull();
    expect(
      screen
        .getAllByRole("link", { name: "Finaliser" })
        .every((link) =>
          link
            .getAttribute("href")
            ?.includes("/dashboard/reports/report-1/edit"),
        ),
    ).toBe(true);
    expect(screen.getByText("Compte rendu envoyé")).toBeTruthy();
    expect(screen.getByText("Animaux ajoutés")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  test("presents today’s appointments as an accessible priority list", () => {
    cleanup();

    render(
      <DashboardOverviewView
        selectedDate={new Date(2026, 6, 2, 0, 0)}
        now={new Date(2026, 6, 2, 12, 0)}
        metrics={{ newAnimals: 0, newOwners: 0, sentReports: 0 }}
        appointments={[
          {
            id: "appointment-priority",
            beginAt: new Date(2026, 6, 2, 10, 30),
            endAt: new Date(2026, 6, 2, 11, 30),
            status: "COMPLETED",
            atHome: false,
            reports: [
              { id: "report-priority", status: "draft", updatedAt: null },
            ],
            patient: {
              id: "patient-priority",
              name: "Tao",
              owner: { id: "owner-priority", name: "Manon Dupont" },
            },
          },
        ]}
        recentActivity={[]}
      />,
    );

    const agenda = screen.getByRole("list", { name: "Séances du jour" });

    expect(agenda).toBeTruthy();
    expect(within(agenda).getAllByRole("listitem")).toHaveLength(1);
    expect(within(agenda).getByText("10:30")).toBeTruthy();
    expect(within(agenda).getByText("Tao")).toBeTruthy();
    expect(
      within(agenda).getByRole("link", { name: "Finaliser" }),
    ).toBeTruthy();
  });
});
