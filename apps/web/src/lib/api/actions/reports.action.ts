export type { GetAllReportsParams } from "#/functions/reports.function";
import {
  createReport as createReportFn,
  deleteReport as deleteReportFn,
  getAllReports as getAllReportsFn,
  getAnatomicalParts as getAnatomicalPartsFn,
  getLatestReports as getLatestReportsFn,
  getPatientAnatomicalHistory as getPatientAnatomicalHistoryFn,
  getReportById as getReportByIdFn,
  seedAnatomicalParts as seedAnatomicalPartsFn,
  updateReport as updateReportFn,
} from "#/functions/reports.function";
import type {
  anatomicalIssueSchema,
  createReportSchema,
  reportSchema,
} from "#/lib/utils/schemas";
import type { z } from "zod";

export function getLatestReports(limit = 10) {
  return getLatestReportsFn({ data: { limit } });
}

export function getAllReports(params: { search?: string; status?: string } = {}) {
  return getAllReportsFn({ data: params });
}

export function createReport(report: z.infer<typeof createReportSchema>) {
  return createReportFn({ data: report });
}

export function getReportById({ reportId }: { reportId: string }) {
  return getReportByIdFn({ data: { reportId } });
}

export function updateReport(
  report: z.infer<typeof reportSchema> & { reportId: string },
) {
  return updateReportFn({ data: report });
}

export function getAnatomicalParts(
  data: z.infer<typeof anatomicalIssueSchema>,
) {
  return getAnatomicalPartsFn({ data });
}

export function deleteReport({ reportId }: { reportId: string }) {
  return deleteReportFn({ data: { reportId } });
}

export function getPatientAnatomicalHistory(data: {
  petId: string;
  anatomicalPartId: string;
  type?: "dysfunction" | "anatomicalSuspicion" | "observation";
}) {
  return getPatientAnatomicalHistoryFn({ data });
}

export function seedAnatomicalParts() {
  return seedAnatomicalPartsFn();
}
