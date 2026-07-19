import {
  createInitialReportSectionStates,
  reportSectionIds,
  type ReportSectionId,
  type ReportSectionState,
  type ReportSectionStates,
} from "@biume/contracts/report";

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
