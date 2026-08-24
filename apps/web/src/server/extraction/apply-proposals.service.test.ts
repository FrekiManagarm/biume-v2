import type { Proposal } from "@biume/contracts/proposal";
import { describe, expect, it } from "vitest";

import { buildReportPatchFromProposals } from "./apply-proposals.service";

const anchor = { start: 0, end: 5, quote: "Filou" };

const proposal = (
  overrides: Pick<Proposal, "kind" | "text" | "state"> & Partial<Proposal>,
): Proposal =>
  ({
    id: `p-${overrides.text}`,
    reportId: "report-1",
    section: "clinical",
    anchor,
    decidedAt: null,
    ...overrides,
  }) as Proposal;

describe("application des propositions confirmées", () => {
  it("n'applique que ce qui est confirmé", () => {
    const patch = buildReportPatchFromProposals([
      proposal({
        kind: "recommendation",
        text: "Repos une semaine",
        state: "confirmed",
      }),
      proposal({
        kind: "recommendation",
        text: "Balades courtes",
        state: "proposed",
      }),
    ]);

    expect(patch.recommendations).toEqual(["Repos une semaine"]);
  });

  it("n'applique jamais une proposition écartée", () => {
    const patch = buildReportPatchFromProposals([
      proposal({
        kind: "recommendation",
        text: "Repos",
        state: "not_applicable",
      }),
    ]);

    expect(patch.recommendations).toEqual([]);
  });

  it("porte le motif de consultation", () => {
    const patch = buildReportPatchFromProposals([
      proposal({
        kind: "consultationReason",
        text: "Boiterie postérieure",
        state: "confirmed",
      }),
    ]);

    expect(patch.consultationReason).toBe("Boiterie postérieure");
  });

  /**
   * Plusieurs observations confirmées forment les notes du rapport, dans
   * l'ordre où elles ont été proposées : c'est l'ordre de la dictée, donc celui
   * du raisonnement du praticien.
   */
  it("assemble les observations dans l'ordre", () => {
    const patch = buildReportPatchFromProposals([
      proposal({
        kind: "observation",
        text: "Tension lombaire",
        state: "confirmed",
      }),
      proposal({
        kind: "observation",
        text: "Amyotrophie postérieure",
        state: "confirmed",
      }),
    ]);

    expect(patch.notes).toBe("Tension lombaire\nAmyotrophie postérieure");
  });

  it("ne produit rien depuis une liste vide", () => {
    expect(buildReportPatchFromProposals([])).toEqual({
      consultationReason: null,
      notes: null,
      recommendations: [],
      anatomicalNotes: [],
    });
  });
});
