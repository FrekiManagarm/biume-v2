// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReportPanelController } from "./ReportPanelController";

const commonProps = {
  onClose: vi.fn(),
  preview: {
    title: "Compte rendu",
    patientName: "Nox",
    entries: [],
  },
  preparation: {
    reportId: "report_01",
    queue: [],
    records: [],
    onSave: vi.fn(),
  },
};

afterEach(cleanup);

describe("ReportPanelController", () => {
  test("renders only the owner preview for owner-preview state", () => {
    render(
      <ReportPanelController
        {...commonProps}
        state={{ type: "owner-preview" }}
      />,
    );

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Aperçu propriétaire" }),
    ).not.toBeNull();
    expect(screen.queryByText("Préparation guidée")).toBeNull();
  });

  test("renders only the preparation sheet for owner-preparation state", () => {
    render(
      <ReportPanelController
        {...commonProps}
        state={{ type: "owner-preparation", sourceKey: "notes:notes" }}
      />,
    );

    const [dialog] = screen.getAllByRole("dialog");
    expect(dialog?.className.split(" ")).toEqual(
      expect.arrayContaining([
        "data-[side=right]:w-screen",
        "data-[side=right]:sm:w-[32rem]",
        "data-[side=right]:sm:max-w-[32rem]",
        "motion-reduce:transition-none",
      ]),
    );
    expect(
      screen.getByRole("heading", { name: "Préparation guidée" }),
    ).not.toBeNull();
    expect(screen.queryByText("Aperçu propriétaire")).toBeNull();
  });

  test("renders no dialog when the panel is closed", () => {
    render(
      <ReportPanelController {...commonProps} state={{ type: "closed" }} />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
