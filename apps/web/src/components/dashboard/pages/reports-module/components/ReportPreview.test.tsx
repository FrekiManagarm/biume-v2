// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ReportPreview } from "./ReportPreview";

describe("ReportPreview", () => {
  test("presents the live report as an owner-facing document", () => {
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

    expect(
      screen.getByRole("heading", { name: "Aperçu propriétaire" }),
    ).not.toBeNull();
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
