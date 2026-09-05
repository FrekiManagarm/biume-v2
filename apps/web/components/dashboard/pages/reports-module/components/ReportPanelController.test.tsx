// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
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
        "data-[side=right]:lg:w-[32rem]",
        "data-[side=right]:lg:max-w-[32rem]",
        "motion-reduce:transition-none",
      ]),
    );
    expect(
      screen.getByRole("heading", { name: "Préparation guidée" }),
    ).not.toBeNull();
    expect(screen.queryByText("Aperçu propriétaire")).toBeNull();
  });

  test.each([
    [390, "w-screen"],
    [768, "w-screen"],
    [1024, "lg:w-[32rem]"],
  ] as const)(
    "keeps the preparation width contract at %ipx",
    (width, expectedClass) => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      render(
        <ReportPanelController
          {...commonProps}
          state={{ type: "owner-preparation" }}
        />,
      );
      expect(screen.getByRole("dialog").className).toContain(expectedClass);
    },
  );

  test("renders no dialog when the panel is closed", () => {
    render(
      <ReportPanelController {...commonProps} state={{ type: "closed" }} />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("returns focus to the invoking control after Escape closes the preview", async () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Ouvrir l’aperçu propriétaire
          </button>
          <ReportPanelController
            {...commonProps}
            state={isOpen ? { type: "owner-preview" } : { type: "closed" }}
            onClose={() => setIsOpen(false)}
          />
        </>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole("button", {
      name: "Ouvrir l’aperçu propriétaire",
    });

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });
});
