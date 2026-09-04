import { db } from "@biume/db";
import { advancedReport, reportSharedVersion } from "@biume/db/schema/index";
import { and, eq } from "drizzle-orm";

import type { ReportSharedVersionPorts } from "#/functions/report-shared-version.service";

export const findReportSharedVersion = ({
  organizationId,
  reportId,
  reportRevision,
}: {
  organizationId: string;
  reportId: string;
  reportRevision: number;
}) =>
  db.query.reportSharedVersion.findFirst({
    where: and(
      eq(reportSharedVersion.reportId, reportId),
      eq(reportSharedVersion.organizationId, organizationId),
      eq(reportSharedVersion.reportRevision, reportRevision),
    ),
  });

export const reportSharedVersionPorts: ReportSharedVersionPorts = {
  loadTenantOwnedReport: ({ organizationId, reportId }) =>
    db.query.advancedReport.findFirst({
      where: and(
        eq(advancedReport.id, reportId),
        eq(advancedReport.createdBy, organizationId),
      ),
      with: {
        patient: { with: { owner: true } },
        anatomicalIssues: { with: { anatomicalPart: true } },
        recommendations: true,
        ownerContents: true,
        sectionStates: true,
      },
    }),
  findExistingVersion: findReportSharedVersion,
  insertImmutableVersion: async ({
    organizationId,
    reportId,
    reportRevision,
    snapshot,
  }) => {
    const [created] = await db
      .insert(reportSharedVersion)
      .values({ organizationId, reportId, reportRevision, snapshot })
      .onConflictDoNothing({
        target: [
          reportSharedVersion.reportId,
          reportSharedVersion.reportRevision,
        ],
      })
      .returning();
    return created;
  },
  findVersionAfterConflict: findReportSharedVersion,
};
