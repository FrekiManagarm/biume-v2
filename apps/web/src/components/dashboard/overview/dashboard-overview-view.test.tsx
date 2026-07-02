import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { DashboardOverviewView } from "./dashboard-overview-view";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("DashboardOverviewView", () => {
  test("renders a compact overview with agenda, priorities, and activity", () => {
    render(
      <DashboardOverviewView
        selectedDate={new Date()}
        metrics={{
          newAnimals: 4,
          newOwners: 2,
          sentReports: 7,
        }}
        appointments={[
          {
            id: "appointment-upcoming",
            beginAt: new Date(Date.now() + 60 * 60 * 1000),
            endAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            status: "CONFIRMED",
            atHome: true,
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
            beginAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            endAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: "COMPLETED",
            atHome: false,
            reports: [{ id: "report-1", status: "draft", updatedAt: null }],
            patient: {
              id: "patient-2",
              name: "Orka",
              owner: { id: "owner-2", name: "Lina Moreau" },
            },
          },
        ]}
        recentActivity={[
          {
            id: "activity-1",
            title: "Compte rendu envoyé",
            description: "Naska · Malo Garnier",
            timestamp: "Il y a 2h",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Vue d'ensemble" }),
    ).toBeTruthy();
    expect(screen.getByText("Agenda du jour")).toBeTruthy();
    expect(screen.getAllByText("Naska").length).toBeGreaterThan(0);
    expect(screen.getByText("À domicile")).toBeTruthy();
    expect(screen.getByText("À traiter")).toBeTruthy();
    expect(screen.getByText("Finaliser · Orka")).toBeTruthy();
    expect(screen.getByText("Compte rendu envoyé")).toBeTruthy();
    expect(screen.getByText("Animaux ajoutés")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });
});
