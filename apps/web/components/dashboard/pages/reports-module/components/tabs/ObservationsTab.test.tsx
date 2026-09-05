// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ObservationsTab } from "./ObservationsTab";

describe("ObservationsTab", () => {
  test("does not duplicate the active report section header or primary add action", () => {
    render(
      <ObservationsTab
        observations={[]}
        onRemoveObservation={vi.fn()}
        onOpenAddSheet={vi.fn()}
        onEditObservation={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Observations cliniques" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Nouvelle observation" }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Aucune observation" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Ajouter une observation" }),
    ).not.toBeNull();
  });
});
