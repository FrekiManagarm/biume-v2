import {
  buildOwnerSourceItems,
  type OwnerSourceItem,
  type OwnerSourceKind,
} from "./owner-content";

export function prepareOwnerContentUpsert({
  reportId,
  sourceKind,
  sourceId,
  ownerText,
  sources,
}: {
  reportId: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
  sources: OwnerSourceItem[];
}) {
  const source = sources.find(
    (item) => item.sourceKind === sourceKind && item.sourceId === sourceId,
  );
  if (!source) throw new Error("Source de rapport introuvable");

  const normalizedOwnerText = ownerText.trim();
  if (!normalizedOwnerText) {
    throw new Error("La version propriétaire est vide");
  }

  return {
    reportId,
    sourceKind,
    sourceId,
    ownerText: normalizedOwnerText,
    sourceFingerprint: source.fingerprint,
    updatedAt: new Date(),
  };
}

export type PersistedOwnerReport = {
  id: string;
  consultationReason: string | null;
  notes: string | null;
  anatomicalIssues: Array<{
    id: string;
    type: "observation" | "dysfunction" | "anatomicalSuspicion";
    observationType:
      "static" | "dynamic" | "diagnosticExclusion" | "none" | null;
    notes: string | null;
    laterality: "left" | "right" | "bilateral";
    severity: number;
    anatomicalPart: { name: string } | null;
  }>;
  recommendations: Array<{
    id: string;
    recommendation: string;
  }>;
};

export function buildPersistedOwnerSources(report: PersistedOwnerReport) {
  return buildOwnerSourceItems({
    reportId: report.id,
    consultationReason: report.consultationReason ?? "",
    observations: report.anatomicalIssues
      .filter((item) => item.type === "observation")
      .map((item) => ({
        id: item.id,
        region: item.anatomicalPart?.name ?? "Zone non précisée",
        severity: item.severity,
        notes: item.notes ?? "",
        type: item.observationType ?? "none",
        laterality: item.laterality,
      })),
    anatomicalIssues: report.anatomicalIssues
      .filter((item) => item.type !== "observation")
      .map((item) => ({
        id: item.id,
        type: item.type as "dysfunction" | "anatomicalSuspicion",
        region: item.anatomicalPart?.name ?? "Zone non précisée",
        severity: item.severity,
        notes: item.notes ?? "",
        laterality: item.laterality,
      })),
    recommendations: report.recommendations.map((item) => ({
      id: item.id,
      content: item.recommendation,
    })),
    notes: report.notes ?? "",
  });
}
