import {
  createInitialReportSectionStates,
  quickReportSchema,
  reportSectionIds,
  type ReportSectionId,
  type ReportSectionState,
  type ReportSectionStates,
} from "@biume/contracts/report";
import type { z } from "zod";

type QuickReportInput = z.infer<typeof quickReportSchema>;

export function buildReportSectionStateRows(
  reportId: string,
  states: ReportSectionStates,
) {
  return reportSectionIds.map((section) => ({
    reportId,
    section,
    state: states[section],
  }));
}

export function normalizeReportSectionStates(
  rows: readonly {
    section: ReportSectionId;
    state: ReportSectionState;
  }[],
): ReportSectionStates {
  const states = createInitialReportSectionStates();
  for (const row of rows) states[row.section] = row.state;
  return states;
}

export function buildQuickReportRows({
  organizationId,
  input,
  ids,
  now,
}: {
  organizationId: string;
  input: QuickReportInput;
  ids: { ownerId: string; animalId: string; reportId: string };
  now: Date;
}) {
  const owner = {
    id: ids.ownerId,
    organizationId,
    name: input.ownerName.trim(),
    email: input.ownerEmail?.trim() || null,
    createdAt: now,
  };
  const animal = {
    id: ids.animalId,
    organizationId,
    ownerId: ids.ownerId,
    name: input.animalName.trim(),
    createdAt: now,
  };
  const report = {
    id: ids.reportId,
    createdBy: organizationId,
    patientId: ids.animalId,
    title: input.title,
    consultationReason: input.consultationReason,
    status: "draft" as const,
    createdAt: now,
  };

  return {
    owner,
    animal,
    report,
    sectionStates: buildReportSectionStateRows(
      ids.reportId,
      createInitialReportSectionStates(),
    ),
  };
}
