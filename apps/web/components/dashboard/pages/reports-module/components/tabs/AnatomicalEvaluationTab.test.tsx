// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({ useQuery: vi.fn() }));
vi.mock("@/lib/api/actions/reports.action", () => ({
  getAnatomicalParts: vi.fn(),
}));

import { AnatomicalEvaluationTab } from "./AnatomicalEvaluationTab";

afterEach(cleanup);

describe("AnatomicalEvaluationTab species guard", () => {
  it("blocks the anatomical workflow when the animal species is missing", () => {
    render(
      <AnatomicalEvaluationTab
        dysfunctions={[]}
        setDysfunctions={vi.fn()}
        onAddDysfunction={vi.fn()}
        isAddModalOpen={false}
        setIsAddModalOpen={vi.fn()}
        animalData={null}
      />,
    );

    expect(screen.getByText("Espèce requise")).not.toBeNull();
    expect(
      screen.getByText(/Aucune anatomie n’est déduite automatiquement/),
    ).not.toBeNull();
    expect(screen.queryByAltText(/Vue anatomique/)).toBeNull();
  });
});
