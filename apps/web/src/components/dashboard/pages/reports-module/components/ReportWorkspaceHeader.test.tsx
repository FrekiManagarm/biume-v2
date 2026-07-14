// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReportWorkspaceHeader } from "./ReportWorkspaceHeader";

afterEach(cleanup);

describe("ReportWorkspaceHeader", () => {
  test("keeps title, patient, appointment and report actions together", () => {
    const onTitleChange = vi.fn();
    const onPreview = vi.fn();
    const onSave = vi.fn();
    const onFinalize = vi.fn();
    render(
      <ReportWorkspaceHeader
        title="Compte rendu initial"
        onTitleChange={onTitleChange}
        patientSummary="Nox · Chien"
        appointment={{
          beginAt: new Date("2026-07-14T09:00:00"),
          endAt: new Date("2026-07-14T10:00:00"),
        }}
        onPreview={onPreview}
        onSave={onSave}
        onFinalize={onFinalize}
        isSaving={false}
      />,
    );

    fireEvent.change(screen.getByLabelText("Titre du rapport"), {
      target: { value: "Compte rendu mobile" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aperçu" }));
    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    fireEvent.click(screen.getByRole("button", { name: "Finaliser" }));

    expect(screen.getByText("Nox · Chien")).not.toBeNull();
    expect(screen.getByText(/14 juil/)).not.toBeNull();
    expect(onTitleChange).toHaveBeenCalledWith("Compte rendu mobile");
    expect(onPreview).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onFinalize).toHaveBeenCalledOnce();
  });
});
