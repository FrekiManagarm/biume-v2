import "server-only";

import { db } from "@biume/db";
import { ownerSourceKindSchema } from "@biume/contracts/report";
import { advancedReport, reportOwnerContent } from "@biume/db/schema/index";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  buildPersistedOwnerSources,
  prepareOwnerContentUpsert,
} from "#/components/dashboard/pages/reports-module/owner-content.persistence";
import { getCurrentOrganization } from "#/functions/auth.function";
import {
  saveOwnerContentWithRevision,
  type OwnerContentRevisionPort,
} from "./report-owner-content.service";

const ownerContentUpsertSchema = z.object({
  reportId: z.string().min(1),
  sourceKind: ownerSourceKindSchema,
  sourceId: z.string().min(1),
  ownerText: z.string(),
});

async function loadOwnedReport(reportId: string, organizationId: string) {
  return db.query.advancedReport.findFirst({
    where: and(
      eq(advancedReport.id, reportId),
      eq(advancedReport.createdBy, organizationId),
    ),
    with: {
      anatomicalIssues: { with: { anatomicalPart: true } },
      recommendations: true,
    },
  });
}

const ownerContentRevisionPort: OwnerContentRevisionPort = {
  persist: async ({
    organizationId,
    reportId,
    ownerContent,
    reportRevision,
  }) => {
    const [savedRows] = await db.batch([
      db
        .insert(reportOwnerContent)
        .values({
          id: crypto.randomUUID(),
          reportId,
          ...ownerContent.values,
        })
        .onConflictDoUpdate({
          target: [
            reportOwnerContent.reportId,
            reportOwnerContent.sourceKind,
            reportOwnerContent.sourceId,
          ],
          set: {
            ownerText: ownerContent.values.ownerText,
            sourceFingerprint: ownerContent.values.sourceFingerprint,
            updatedAt: ownerContent.values.updatedAt,
          },
        })
        .returning(),
      db
        .update(advancedReport)
        .set({
          revision: sql`${advancedReport.revision} + 1`,
          updatedAt: reportRevision.updatedAt,
        })
        .where(
          and(
            eq(advancedReport.id, reportId),
            eq(advancedReport.createdBy, organizationId),
          ),
        ),
    ] as const);

    return savedRows[0];
  },
};

export type UpsertReportOwnerContentInput = z.infer<
  typeof ownerContentUpsertSchema
>;

export async function upsertReportOwnerContent(
  input: UpsertReportOwnerContentInput,
) {
  const data = ownerContentUpsertSchema.parse(input);
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("Organization not found");

  const report = await loadOwnedReport(data.reportId, organization.id);
  if (!report) throw new Error("Report not found or unauthorized");

  const values = prepareOwnerContentUpsert({
    ...data,
    sources: buildPersistedOwnerSources(report),
  });
  const saved = await saveOwnerContentWithRevision(
    {
      organizationId: organization.id,
      reportId: data.reportId,
      ownerContent: values,
    },
    ownerContentRevisionPort,
  );

  return { success: true as const, data: saved };
}
