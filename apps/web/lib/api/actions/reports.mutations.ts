"use server";

import type { quickReportSchema } from "@biume/contracts/report";
import type { z } from "zod";

import {
  createQuickReport as createQuickReportFn,
  createReport as createReportFn,
  createReportSharedVersion as createReportSharedVersionFn,
  deleteReport as deleteReportFn,
  seedAnatomicalParts as seedAnatomicalPartsFn,
  updateReport as updateReportFn,
} from "#/functions/reports.function";
import type {
  createReportSchema,
  updateReportSchema,
} from "#/lib/utils/schemas";

export async function createReport(report: z.input<typeof createReportSchema>) {
  return createReportFn(report);
}

export async function createQuickReport(report: z.input<typeof quickReportSchema>) {
  return createQuickReportFn(report);
}

export async function updateReport(report: z.input<typeof updateReportSchema>) {
  return updateReportFn(report);
}

export async function createReportSharedVersion(reportId: string) {
  return createReportSharedVersionFn({ reportId });
}

export async function seedAnatomicalParts() {
  return seedAnatomicalPartsFn();
}

export async function deleteReport({ reportId }: { reportId: string }) {
  return deleteReportFn({ reportId });
}
