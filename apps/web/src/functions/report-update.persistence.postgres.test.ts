import { randomUUID } from "node:crypto";

import { PgDialect } from "drizzle-orm/pg-core";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildAtomicReportUpdateStatement } from "./report-update.persistence";

const databaseUrl = process.env.REPORT_UPDATE_TEST_DATABASE_URL;
const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres("atomic report update against PostgreSQL", () => {
  const client = new Client({ connectionString: databaseUrl });
  const suffix = randomUUID();
  const organizationId = `org-${suffix}`;
  const patientId = `pet-${suffix}`;
  const reportId = `report-${suffix}`;
  const anatomicalPartId = `part-${suffix}`;
  const keptIssueId = `issue-keep-${suffix}`;
  const removedIssueId = `issue-remove-${suffix}`;
  const staleIssueId = `issue-stale-${suffix}`;
  const keptRecommendationId = `rec-keep-${suffix}`;
  const removedRecommendationId = `rec-remove-${suffix}`;
  const staleRecommendationId = `rec-stale-${suffix}`;
  const removedOwnerContentId = `owner-remove-${suffix}`;
  const staleOwnerContentId = `owner-stale-${suffix}`;

  beforeAll(async () => {
    await client.connect();
    await client.query("BEGIN");
    await client.query(
      'INSERT INTO "organizations" ("id", "name") VALUES ($1, $2)',
      [organizationId, "OCC test"],
    );
    await client.query(
      'INSERT INTO "pets" ("id", "name", "organizationId") VALUES ($1, $2, $3)',
      [patientId, "Patient OCC", organizationId],
    );
    await client.query(
      'INSERT INTO "advancedReport" ("id", "createdBy", "title", "patientId", "revision") VALUES ($1, $2, $3, $4, 1)',
      [reportId, organizationId, "Initial", patientId],
    );
    await client.query(
      'INSERT INTO "anatomical_part" ("id", "zone", "name") VALUES ($1, $2, $3)',
      [anatomicalPartId, "muscles", "Muscle test"],
    );
    await client.query(
      'INSERT INTO "anatomical_issue" ("id", "anatomical_part_id", "advanced_report_id", "notes") VALUES ($1, $3, $4, $5), ($2, $3, $4, $6)',
      [
        keptIssueId,
        removedIssueId,
        anatomicalPartId,
        reportId,
        "old kept issue",
        "remove issue",
      ],
    );
    await client.query(
      'INSERT INTO "advanced_report_recommendations" ("id", "advanced_report_id", "recommendation") VALUES ($1, $3, $4), ($2, $3, $5)',
      [
        keptRecommendationId,
        removedRecommendationId,
        reportId,
        "old kept recommendation",
        "remove recommendation",
      ],
    );
    await client.query(
      'INSERT INTO "report_owner_content" ("id", "report_id", "source_kind", "source_id", "owner_text", "source_fingerprint") VALUES ($1, $2, $3, $4, $5, $6)',
      [
        removedOwnerContentId,
        reportId,
        "notes",
        "owner-remove",
        "remove me",
        "fingerprint-remove",
      ],
    );
  });

  afterAll(async () => {
    if (!databaseUrl) return;
    await client.query("ROLLBACK");
    await client.end();
  });

  async function save({
    expectedRevision,
    title,
    issueNotes,
    recommendation,
    removedOwnerSourceId,
    includeStaleRows = false,
  }: {
    expectedRevision: number;
    title: string;
    issueNotes: string;
    recommendation: string;
    removedOwnerSourceId: string;
    includeStaleRows?: boolean;
  }) {
    const statement = buildAtomicReportUpdateStatement({
      organizationId,
      reportId,
      expectedRevision,
      title,
      consultationReason: "Suivi",
      patientId,
      appointmentId: null,
      notes: `${title} notes`,
      status: "draft",
      updatedAt: new Date("2026-07-19T12:00:00.000Z"),
      sectionStates: [
        { reportId, section: "clinical", state: "confirmed" },
        { reportId, section: "anatomical", state: "confirmed" },
        { reportId, section: "recommendations", state: "confirmed" },
        { reportId, section: "notes", state: "confirmed" },
      ],
      removedOwnerSources: [
        { sourceKind: "notes", sourceId: removedOwnerSourceId },
      ],
      anatomicalRows: [
        {
          id: keptIssueId,
          type: "observation",
          advancedReportId: reportId,
          notes: issueNotes,
          anatomicalPartId,
          laterality: "left",
          severity: 2,
          observationType: "dynamic",
        },
        ...(includeStaleRows
          ? [
              {
                id: staleIssueId,
                type: "observation" as const,
                advancedReportId: reportId,
                notes: "stale inserted issue",
                anatomicalPartId,
                laterality: "right" as const,
                severity: 5,
                observationType: "static" as const,
              },
            ]
          : []),
      ],
      recommendationRows: [
        {
          id: keptRecommendationId,
          advancedReportId: reportId,
          recommendation,
        },
        ...(includeStaleRows
          ? [
              {
                id: staleRecommendationId,
                advancedReportId: reportId,
                recommendation: "stale inserted recommendation",
              },
            ]
          : []),
      ],
    });
    const query = new PgDialect().sqlToQuery(statement);
    return client.query(query.sql, query.params);
  }

  it("saves identical child IDs twice and leaves every winner table untouched by a stale writer", async () => {
    const first = await save({
      expectedRevision: 1,
      title: "Winner one",
      issueNotes: "winner issue one",
      recommendation: "winner recommendation one",
      removedOwnerSourceId: "owner-remove",
    });
    expect(first.rows).toEqual([{ id: reportId, revision: 2 }]);

    const second = await save({
      expectedRevision: 2,
      title: "Winner two",
      issueNotes: "winner issue two",
      recommendation: "winner recommendation two",
      removedOwnerSourceId: "owner-remove",
    });
    expect(second.rows).toEqual([{ id: reportId, revision: 3 }]);

    await client.query(
      'INSERT INTO "report_owner_content" ("id", "report_id", "source_kind", "source_id", "owner_text", "source_fingerprint") VALUES ($1, $2, $3, $4, $5, $6)',
      [
        staleOwnerContentId,
        reportId,
        "notes",
        "owner-stale",
        "winner owner content",
        "fingerprint-stale",
      ],
    );

    const stale = await save({
      expectedRevision: 2,
      title: "Stale writer",
      issueNotes: "stale issue",
      recommendation: "stale recommendation",
      removedOwnerSourceId: "owner-stale",
      includeStaleRows: true,
    });
    expect(stale.rows).toEqual([]);

    const report = await client.query(
      'SELECT "title", "revision" FROM "advancedReport" WHERE "id" = $1',
      [reportId],
    );
    expect(report.rows).toEqual([{ title: "Winner two", revision: 3 }]);

    const issues = await client.query(
      'SELECT "id", "notes" FROM "anatomical_issue" WHERE "advanced_report_id" = $1 ORDER BY "id"',
      [reportId],
    );
    expect(issues.rows).toEqual([
      { id: keptIssueId, notes: "winner issue two" },
    ]);

    const recommendations = await client.query(
      'SELECT "id", "recommendation" FROM "advanced_report_recommendations" WHERE "advanced_report_id" = $1 ORDER BY "id"',
      [reportId],
    );
    expect(recommendations.rows).toEqual([
      {
        id: keptRecommendationId,
        recommendation: "winner recommendation two",
      },
    ]);

    const sections = await client.query(
      'SELECT "section", "state" FROM "report_section_state" WHERE "report_id" = $1 ORDER BY "section"',
      [reportId],
    );
    expect(sections.rows).toHaveLength(4);
    expect(sections.rows.every((row) => row.state === "confirmed")).toBe(true);

    const ownerContents = await client.query(
      'SELECT "source_id" FROM "report_owner_content" WHERE "report_id" = $1 ORDER BY "source_id"',
      [reportId],
    );
    expect(ownerContents.rows).toEqual([{ source_id: "owner-stale" }]);
  });
});
