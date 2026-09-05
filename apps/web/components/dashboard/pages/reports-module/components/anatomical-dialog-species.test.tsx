// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddAnatomicalIssueDialog } from "./AddAnatomicalIssueDialog";
import { AddObservationDialog } from "./AddObservationsDialog";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: [], isLoading: false }),
}));

vi.mock("react-hotkeys-hook", () => ({
  useHotkeys: () => undefined,
}));

vi.mock("@/lib/api/actions/reports.action", () => ({
  getAnatomicalParts: vi.fn(),
}));

vi.mock("./AnatomicalHistoryAndDiagnosticPanel", () => ({
  AnatomicalHistoryAndDiagnosticPanel: () => null,
}));

vi.mock("@/components/ui/credenza", () => ({
  Credenza: ({
    open,
    children,
  }: {
    open?: boolean;
    children: React.ReactNode;
  }) => (open ? children : null),
  CredenzaContent: ({ children }: { children: React.ReactNode }) => children,
  CredenzaHeader: ({ children }: { children: React.ReactNode }) => children,
  CredenzaTitle: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(cleanup);

describe("anatomical entry dialog species guards", () => {
  it.each([null, { code: "BIRD", name: "Perroquet" }])(
    "keeps the observation dialog closed for %o species",
    (animalData) => {
      const onOpenChange = vi.fn();
      render(
        <AddObservationDialog
          isOpen
          onOpenChange={onOpenChange}
          newObservation={{
            region: "",
            severity: 1,
            notes: "",
            type: "static",
            interventionZone: undefined,
            laterality: "left",
          }}
          setNewObservation={vi.fn()}
          onAdd={vi.fn()}
          animalData={animalData}
        />,
      );

      expect(screen.queryByText("Ajouter une observation")).toBeNull();
      return waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    },
  );

  it.each([null, { code: "BIRD", name: "Perroquet" }])(
    "keeps the anatomical issue dialog closed for %o species",
    (animalData) => {
      const onOpenChange = vi.fn();
      render(
        <AddAnatomicalIssueDialog
          isOpen
          onOpenChange={onOpenChange}
          issueType="dysfunction"
          newIssue={{
            type: "dysfunction",
            region: "",
            severity: 2,
            notes: "",
            interventionZone: "",
            laterality: "left",
          }}
          setNewIssue={vi.fn()}
          onAdd={vi.fn()}
          animalData={animalData}
        />,
      );

      expect(screen.queryByText("Ajouter un élément anatomique")).toBeNull();
      return waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    },
  );
});
