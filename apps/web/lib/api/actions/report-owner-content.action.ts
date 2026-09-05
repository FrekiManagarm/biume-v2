import type { OwnerSourceKind } from "#/components/dashboard/pages/reports-module/owner-content";
import { upsertReportOwnerContent as upsertReportOwnerContentFn } from "#/functions/report-owner-content.function";

export function upsertReportOwnerContent(data: {
  reportId: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
}) {
  return upsertReportOwnerContentFn({ data });
}
