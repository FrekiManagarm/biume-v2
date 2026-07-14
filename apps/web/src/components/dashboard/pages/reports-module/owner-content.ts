import type { AnatomicalIssue, Observation } from "./types";

export type ReportSectionId =
  "clinical" | "anatomical" | "recommendations" | "notes";
export type OwnerSourceKind =
  | "consultationReason"
  | "observation"
  | "anatomicalIssue"
  | "recommendation"
  | "notes";
export type OwnerContentStatus = "missing" | "stale" | "ready";

export type OwnerContentRecord = {
  id: string;
  reportId: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
  sourceFingerprint: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type OwnerSourceItem = {
  key: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  section: ReportSectionId;
  professionalText: string;
  context: string;
  fingerprint: string;
  order: number;
};

type BuildOwnerSourceItemsInput = {
  reportId: string;
  consultationReason: string;
  observations: Observation[];
  anatomicalIssues: AnatomicalIssue[];
  recommendations: Array<{ id: string; content: string }>;
  notes: string;
};

function fingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createSource(
  sourceKind: OwnerSourceKind,
  sourceId: string,
  section: ReportSectionId,
  professionalText: string,
  context: string,
  order: number,
): OwnerSourceItem | null {
  const text = professionalText.trim();
  if (!text) return null;
  return {
    key: `${sourceKind}:${sourceId}`,
    sourceKind,
    sourceId,
    section,
    professionalText: text,
    context,
    fingerprint: fingerprint(
      JSON.stringify({ sourceKind, sourceId, professionalText: text, context }),
    ),
    order,
  };
}

export function buildOwnerSourceItems(
  input: BuildOwnerSourceItemsInput,
): OwnerSourceItem[] {
  const sources: Array<OwnerSourceItem | null> = [];
  let order = 0;
  sources.push(
    createSource(
      "consultationReason",
      "consultationReason",
      "clinical",
      input.consultationReason,
      "Motif de consultation",
      order++,
    ),
  );
  for (const observation of input.observations) {
    const displayedRegion =
      observation.anatomicalPart?.name ?? observation.region;
    sources.push(
      createSource(
        "observation",
        observation.id,
        "clinical",
        observation.notes || displayedRegion,
        JSON.stringify({
          region: displayedRegion,
          laterality: observation.laterality,
          severity: observation.severity,
          type: observation.type,
        }),
        order++,
      ),
    );
  }
  for (const issue of input.anatomicalIssues) {
    const displayedRegion = issue.anatomicalPart?.name ?? issue.region;
    sources.push(
      createSource(
        "anatomicalIssue",
        issue.id,
        "anatomical",
        issue.notes || displayedRegion,
        JSON.stringify({
          region: displayedRegion,
          laterality: issue.laterality,
          severity: issue.severity,
          type: issue.type,
        }),
        order++,
      ),
    );
  }
  for (const recommendation of input.recommendations) {
    sources.push(
      createSource(
        "recommendation",
        recommendation.id,
        "recommendations",
        recommendation.content,
        "Recommandation",
        order++,
      ),
    );
  }
  sources.push(
    createSource("notes", "notes", "notes", input.notes, "Notes", order),
  );
  return sources.filter((source): source is OwnerSourceItem => source !== null);
}

function recordFor(source: OwnerSourceItem, records: OwnerContentRecord[]) {
  return records.find(
    (record) =>
      record.sourceKind === source.sourceKind &&
      record.sourceId === source.sourceId,
  );
}

export function deriveOwnerContentStatus(
  source: OwnerSourceItem,
  record?: OwnerContentRecord,
): OwnerContentStatus {
  if (!record) return "missing";
  return record.sourceFingerprint === source.fingerprint ? "ready" : "stale";
}

export function buildOwnerPreparationQueue(
  sources: OwnerSourceItem[],
  records: OwnerContentRecord[],
) {
  const priority: Record<OwnerContentStatus, number> = {
    stale: 0,
    missing: 1,
    ready: 2,
  };
  return sources
    .map((source) => ({
      ...source,
      status: deriveOwnerContentStatus(source, recordFor(source, records)),
    }))
    .filter((source) => source.status !== "ready")
    .sort(
      (left, right) =>
        priority[left.status] - priority[right.status] ||
        left.order - right.order,
    );
}

export function resolveOwnerText(
  source: OwnerSourceItem,
  record?: OwnerContentRecord,
) {
  if (!record) {
    return {
      text: source.professionalText,
      status: "missing" as const,
      usedFallback: true,
    };
  }
  return {
    text: record.ownerText,
    status: deriveOwnerContentStatus(source, record),
    usedFallback: false,
  };
}
