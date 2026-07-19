import type { OwnerSourceKind } from "./owner-content";
import type { AnatomicalIssue, Observation } from "./types";

type Recommendation = { id: string; content: string };
type PersistedObservation = Pick<
  Observation,
  "id" | "region" | "notes" | "laterality" | "severity" | "type"
>;
type PersistedAnatomicalIssue = Pick<
  AnatomicalIssue,
  "id" | "region" | "notes" | "laterality" | "severity" | "type"
>;
type AnatomicalItem =
  Pick<Observation, "region"> | Pick<AnatomicalIssue, "region">;

export function buildReportChildRows({
  reportId,
  observations,
  anatomicalIssues,
  recommendations,
  resolveAnatomicalPartId,
}: {
  reportId: string;
  observations: PersistedObservation[];
  anatomicalIssues: PersistedAnatomicalIssue[];
  recommendations: Recommendation[];
  resolveAnatomicalPartId: (item: AnatomicalItem) => string;
}) {
  return {
    observations: observations.map((observation) => ({
      id: observation.id,
      type: "observation" as const,
      advancedReportId: reportId,
      notes: observation.notes,
      anatomicalPartId: resolveAnatomicalPartId(observation),
      laterality: observation.laterality,
      severity: observation.severity,
      observationType: observation.type,
    })),
    anatomicalIssues: anatomicalIssues.map((issue) => ({
      id: issue.id,
      type: issue.type,
      advancedReportId: reportId,
      notes: issue.notes,
      anatomicalPartId: resolveAnatomicalPartId(issue),
      laterality: issue.laterality,
      severity: issue.severity,
      observationType: "none" as const,
    })),
    recommendations: recommendations.map((recommendation) => ({
      id: recommendation.id,
      advancedReportId: reportId,
      recommendation: recommendation.content,
    })),
  };
}

type OwnerSourceRef = {
  sourceKind: OwnerSourceKind;
  sourceId: string;
};

export function getRemovedOwnerSources(
  existing: OwnerSourceRef[],
  next: Record<"observation" | "anatomicalIssue" | "recommendation", string[]>,
) {
  return existing.filter((source) => {
    if (source.sourceKind === "observation") {
      return !next.observation.includes(source.sourceId);
    }
    if (source.sourceKind === "anatomicalIssue") {
      return !next.anatomicalIssue.includes(source.sourceId);
    }
    if (source.sourceKind === "recommendation") {
      return !next.recommendation.includes(source.sourceId);
    }
    return false;
  });
}

export function buildQuickReportMutationQueries<
  OwnerInsert,
  AnimalInsert,
  ReportInsert,
  SectionStateInsert,
>({
  ownerInsert,
  animalInsert,
  reportInsert,
  sectionStateInsert,
}: {
  ownerInsert: OwnerInsert;
  animalInsert: AnimalInsert;
  reportInsert: ReportInsert;
  sectionStateInsert: SectionStateInsert;
}) {
  return [ownerInsert, animalInsert, reportInsert, sectionStateInsert] as const;
}

export function executeAtomicReportMutations<
  const Mutations extends readonly [unknown, ...unknown[]],
  Result,
>(
  mutations: Mutations,
  executeBatch: (mutations: Mutations) => Promise<Result>,
) {
  return executeBatch(mutations);
}

export function buildReportUpdateMutationQueries<
  ReportUpdate,
  SectionStateUpsert,
  const OwnerSourceDeletions extends readonly unknown[],
  const ChildDeletions extends readonly unknown[],
  const ChildInserts extends readonly unknown[],
>({
  reportUpdate,
  sectionStateUpsert,
  ownerSourceDeletions,
  childDeletions,
  childInserts,
}: {
  reportUpdate: ReportUpdate;
  sectionStateUpsert: SectionStateUpsert;
  ownerSourceDeletions: OwnerSourceDeletions;
  childDeletions: ChildDeletions;
  childInserts: ChildInserts;
}) {
  return [
    reportUpdate,
    sectionStateUpsert,
    ...ownerSourceDeletions,
    ...childDeletions,
    ...childInserts,
  ] as const;
}
