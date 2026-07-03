import type { QueryClient } from "@tanstack/react-query";

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
