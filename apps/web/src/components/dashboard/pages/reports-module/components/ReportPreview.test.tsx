// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { OwnerReportPreviewSheet, ReportPreview } from "./ReportPreview";

afterEach(cleanup);

describe("OwnerReportPreviewSheet", () => {
  test("presents an accessible owner preview with preparation statuses", () => {
    render(
      <OwnerReportPreviewSheet
        open
        onOpenChange={vi.fn()}
        title="Compte rendu de suivi"
        patientName="Nox"
        entries={[
          {
            key: "observation:observation-1",
            label: "Thorax",
            text: "Mobilité améliorée pendant la séance.",
            status: "stale",
            usedFallback: false,
          },
          {
            key: "notes:notes",
            label: "Informations complémentaires",
            text: "Surveiller le confort dans les prochains jours.",
            status: "missing",
            usedFallback: true,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Aperçu propriétaire" }),
    ).not.toBeNull();
    expect(screen.getByRole("dialog").className.split(" ")).toEqual(
      expect.arrayContaining([
        "data-[side=right]:w-screen",
        "data-[side=right]:sm:w-[32rem]",
        "data-[side=right]:sm:max-w-[32rem]",
      ]),
    );
    expect(screen.getByText("Compte rendu de suivi · Nox")).not.toBeNull();
    expect(
      screen.getByText("Mobilité améliorée pendant la séance."),
    ).not.toBeNull();
    expect(screen.getByText("À actualiser")).not.toBeNull();
    expect(screen.getByText("Texte professionnel utilisé")).not.toBeNull();
  });

  test("preserves the existing owner document body in the legacy preview", () => {
    render(
      <ReportPreview
        isOpen
        onClose={vi.fn()}
        title="Compte rendu de suivi"
        consultationReason="Gêne locomotrice après une longue sortie"
        patientName="Nox"
        observations={[
          {
            id: "observation-1",
            region: "Thorax",
            severity: 2,
            notes: "Mobilité améliorée pendant la séance.",
            type: "dynamic",
            laterality: "left",
          },
        ]}
        notes="Surveiller le confort dans les prochains jours."
        recommendations={[
          {
            id: "recommendation-1",
            content: "Privilégier des sorties courtes pendant 48 heures.",
          },
        ]}
        anatomicalIssues={[]}
        images={[]}
      />,
    );

    expect(screen.getByText("Compte rendu de Nox")).not.toBeNull();
    expect(
      screen.getByText("Gêne locomotrice après une longue sortie"),
    ).not.toBeNull();
    expect(
      screen.getByText("Mobilité améliorée pendant la séance."),
    ).not.toBeNull();
    expect(
      screen.getByText("Privilégier des sorties courtes pendant 48 heures."),
    ).not.toBeNull();
    expect(screen.getByText("Prêt à relire")).not.toBeNull();
  });
});
