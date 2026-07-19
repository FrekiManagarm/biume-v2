"use server";

import { db } from "@biume/db";
import { advancedReport, reportOwnerContent } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  buildPersistedOwnerSources,
  prepareOwnerContentUpsert,
} from "#/components/dashboard/pages/reports-module/owner-content.persistence";
import { getCurrentOrganization } from "#/functions/auth.function";
import { executeOwnerContentRevisionMutation } from "./report-domain";

const ownerContentUpsertSchema = z.object({
  reportId: z.string().min(1),
  sourceKind: z.enum([
    "consultationReason",
    "observation",
    "anatomicalIssue",
    "recommendation",
    "notes",
  ]),
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

export const upsertReportOwnerContent = createServerFn({ method: "POST" })
  .validator(ownerContentUpsertSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const report = await loadOwnedReport(data.reportId, organization.id);
    if (!report) throw new Error("Report not found or unauthorized");

    const values = prepareOwnerContentUpsert({
      ...data,
      sources: buildPersistedOwnerSources(report),
    });
    const saved = await executeOwnerContentRevisionMutation({
      ownerContentUpsert: db
        .insert(reportOwnerContent)
        .values({ id: crypto.randomUUID(), ...values })
        .onConflictDoUpdate({
          target: [
            reportOwnerContent.reportId,
            reportOwnerContent.sourceKind,
            reportOwnerContent.sourceId,
          ],
          set: {
            ownerText: values.ownerText,
            sourceFingerprint: values.sourceFingerprint,
            updatedAt: values.updatedAt,
          },
        })
        .returning(),
      reportRevisionUpdate: db
        .update(advancedReport)
        .set({
          revision: sql`${advancedReport.revision} + 1`,
          updatedAt: values.updatedAt,
        })
        .where(
          and(
            eq(advancedReport.id, data.reportId),
            eq(advancedReport.createdBy, organization.id),
          ),
        ),
      executeBatch: (queries) => db.batch(queries),
    });

    return { success: true as const, data: saved };
  });
