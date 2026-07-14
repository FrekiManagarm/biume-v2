import type { QueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/style";
import type { OwnerContentRecord } from "./owner-content";
import type { AnatomicalIssue, Observation } from "./types";

type ReportRecommendationDraft = {
  id: string;
  content: string;
};

export type ReportUpdateStatus = "draft" | "finalized";

type BuildReportUpdatePayloadInput = {
  reportId: string;
  title: string;
  selectedPetId: string;
  consultationReason: string;
  notes: string;
  observations: Observation[];
  anatomicalIssues: AnatomicalIssue[];
  recommendations: ReportRecommendationDraft[];
  status: ReportUpdateStatus;
};

export type ReportDraftState = Pick<
  BuildReportUpdatePayloadInput,
  | "title"
  | "consultationReason"
  | "notes"
  | "observations"
  | "anatomicalIssues"
  | "recommendations"
>;

export function buildReportUpdatePayload({
  reportId,
  title,
  selectedPetId,
  consultationReason,
  notes,
  observations,
  anatomicalIssues,
  recommendations,
  status,
}: BuildReportUpdatePayloadInput) {
  return {
    reportId,
    title: title.trim() || "Nouveau rapport",
    petId: selectedPetId || undefined,
    consultationReason,
    notes,
    observations,
    anatomicalIssues,
    recommendations,
    status,
  };
}

type ReportQueryClient = Pick<QueryClient, "invalidateQueries">;

export function getReportDesktopGridClassName(isSidebarCollapsed: boolean) {
  return cn(
    "grid h-full w-full gap-5 p-4 transition-[grid-template-columns] duration-200",
    isSidebarCollapsed
      ? "grid-cols-[72px_minmax(0,1fr)]"
      : "grid-cols-[18rem_minmax(0,1fr)]",
  );
}

export function getReportDraftRevision(draft: ReportDraftState) {
  return JSON.stringify(draft);
}

export async function ensureSuccessfulReportUpdate(
  update: () => Promise<boolean>,
) {
  if (!(await update())) {
    throw new Error("Échec de la mise à jour du rapport");
  }
}

export function runExclusiveReportSave(
  guard: { current: Promise<boolean> | null },
  save: () => Promise<boolean>,
) {
  if (guard.current) return Promise.resolve(false);
  const pending = save().finally(() => {
    if (guard.current === pending) guard.current = null;
  });
  guard.current = pending;
  return pending;
}

export async function openOwnerPreparation({
  hasUnsavedChanges,
  saveDraft,
  openPanel,
  getRevision,
}: {
  hasUnsavedChanges: boolean;
  saveDraft: () => Promise<boolean>;
  openPanel: () => void;
  getRevision?: () => string;
}) {
  const revisionBeforeSave = getRevision?.();
  if (hasUnsavedChanges) {
    if (!(await saveDraft())) return false;
    if (revisionBeforeSave !== getRevision?.()) return false;
  }
  openPanel();
  return true;
}

export function replaceOwnerContentRecord(
  records: OwnerContentRecord[],
  replacement: OwnerContentRecord,
) {
  const matchingIndex = records.findIndex(
    (record) =>
      record.sourceKind === replacement.sourceKind &&
      record.sourceId === replacement.sourceId,
  );
  if (matchingIndex === -1) return [...records, replacement];
  return records.map((record, index) =>
    index === matchingIndex ? replacement : record,
  );
}

export async function invalidateReportDetailQuery(
  queryClient: ReportQueryClient,
  reportId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: ["reports", "detail", reportId],
  });
}

export async function invalidateReportUpdateQueries(
  queryClient: ReportQueryClient,
  reportId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["reports", "list"] }),
    queryClient.invalidateQueries({
      queryKey: ["reports", "detail", reportId],
    }),
  ]);
}
