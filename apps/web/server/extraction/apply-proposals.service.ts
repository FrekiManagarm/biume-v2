import type { Proposal } from "@biume/contracts/proposal";

export type ReportPatch = {
  consultationReason: string | null;
  notes: string | null;
  recommendations: string[];
  anatomicalNotes: string[];
};

/**
 * Seules les propositions confirmées deviennent du contenu de rapport. Ce qui
 * est en attente n'existe pas encore pour le praticien, et ce qu'il a écarté ne
 * doit jamais réapparaître dans un document qu'il enverra au propriétaire.
 */
export function buildReportPatchFromProposals(
  proposals: readonly Proposal[],
): ReportPatch {
  const confirmed = proposals.filter(
    (proposal) => proposal.state === "confirmed",
  );

  const byKind = (kind: Proposal["kind"]) =>
    confirmed.filter((proposal) => proposal.kind === kind).map((p) => p.text);

  const observations = byKind("observation");
  const reasons = byKind("consultationReason");

  return {
    consultationReason: reasons[0] ?? null,
    notes: observations.length > 0 ? observations.join("\n") : null,
    recommendations: byKind("recommendation"),
    anatomicalNotes: byKind("anatomicalIssue"),
  };
}
