export type { GetAllReportsParams } from "#/functions/reports.function";
import {
  createReportSharedVersion as createReportSharedVersionFn,
  createQuickReport as createQuickReportFn,
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
import type { quickReportSchema } from "@biume/contracts/report";
import type {
  anatomicalIssueSchema,
  createReportSchema,
  updateReportSchema,
} from "#/lib/utils/schemas";
import type { z } from "zod";

export function getLatestReports(limit = 10) {
  return getLatestReportsFn({ data: { limit } });
}

export function getAllReports(
  params: { search?: string; status?: string } = {},
) {
  return getAllReportsFn({ data: params });
}

export function createReport(report: z.input<typeof createReportSchema>) {
  return createReportFn({ data: report });
}

export function createQuickReport(report: z.input<typeof quickReportSchema>) {
  return createQuickReportFn({ data: report });
}

export function createReportSharedVersion(reportId: string) {
  return createReportSharedVersionFn({ data: { reportId } });
}

export function getReportById({ reportId }: { reportId: string }) {
  return getReportByIdFn({ data: { reportId } });
}

export function updateReport(report: z.input<typeof updateReportSchema>) {
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
