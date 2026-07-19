import { sql } from "drizzle-orm";
import type {
  OwnerSourceKind,
  ReportSectionId,
  ReportSectionState,
} from "@biume/contracts/report";

type SectionStateRow = {
  reportId: string;
  section: ReportSectionId;
  state: ReportSectionState;
};

type OwnerSourceRef = {
  sourceKind: OwnerSourceKind;
  sourceId: string;
};

type AnatomicalRow = {
  id: string;
  type: "observation" | "dysfunction" | "anatomicalSuspicion";
  advancedReportId: string;
  notes: string;
  anatomicalPartId: string;
  laterality: "left" | "right" | "bilateral";
  severity: number;
  observationType: "dynamic" | "static" | "diagnosticExclusion" | "none";
};

type RecommendationRow = {
  id: string;
  advancedReportId: string;
  recommendation: string;
};

type AtomicReportUpdateInput = {
  organizationId: string;
  reportId: string;
  expectedRevision: number;
  title: string;
  consultationReason: string;
  patientId: string;
  appointmentId: string | null;
  notes: string;
  status: "draft" | "finalized" | "sent";
  updatedAt: Date;
  sectionStates: SectionStateRow[];
  removedOwnerSources: OwnerSourceRef[];
  anatomicalRows: AnatomicalRow[];
  recommendationRows: RecommendationRow[];
};

/**
 * Neon HTTP cannot run interactive transactions. A single data-modifying CTE
 * keeps the optimistic revision claim and every child replacement indivisible.
 */
export function buildAtomicReportUpdateStatement(
  input: AtomicReportUpdateInput,
) {
  const sectionStates = JSON.stringify(
    input.sectionStates.map(({ section, state }) => ({ section, state })),
  );
  const removedOwnerSources = JSON.stringify(
    input.removedOwnerSources.map(({ sourceKind, sourceId }) => ({
      source_kind: sourceKind,
      source_id: sourceId,
    })),
  );
  const anatomicalRows = JSON.stringify(
    input.anatomicalRows.map((row) => ({
      id: row.id,
      type: row.type,
      observation_type: row.observationType,
      anatomical_part_id: row.anatomicalPartId,
      notes: row.notes,
      laterality: row.laterality,
      severity: row.severity,
    })),
  );
  const recommendationRows = JSON.stringify(
    input.recommendationRows.map((row) => ({
      id: row.id,
      recommendation: row.recommendation,
    })),
  );

  return sql`
    WITH "updated_report" AS (
      UPDATE "advancedReport"
      SET
        "title" = ${input.title},
        "consultationReason" = ${input.consultationReason},
        "patientId" = ${input.patientId},
        "appointmentId" = ${input.appointmentId},
        "notes" = ${input.notes},
        "updatedAt" = ${input.updatedAt},
        "status" = ${input.status}::"reportStatus",
        "revision" = "revision" + 1
      WHERE "id" = ${input.reportId}
        AND "createdBy" = ${input.organizationId}
        AND "revision" = ${input.expectedRevision}
      RETURNING "id", "revision"
    ),
    "deleted_owner_sources" AS (
      DELETE FROM "report_owner_content" AS "content"
      USING jsonb_to_recordset(${removedOwnerSources}::jsonb)
        AS "removed"("source_kind" text, "source_id" text)
      WHERE "content"."report_id" = ${input.reportId}
        AND "content"."source_kind" = "removed"."source_kind"::"report_owner_content_source_kind"
        AND "content"."source_id" = "removed"."source_id"
        AND EXISTS (SELECT 1 FROM "updated_report")
      RETURNING "content"."id"
    ),
    "deleted_anatomical_rows" AS (
      DELETE FROM "anatomical_issue"
      WHERE "advanced_report_id" = ${input.reportId}
        AND EXISTS (SELECT 1 FROM "updated_report")
      RETURNING "id"
    ),
    "deleted_recommendation_rows" AS (
      DELETE FROM "advanced_report_recommendations"
      WHERE "advanced_report_id" = ${input.reportId}
        AND EXISTS (SELECT 1 FROM "updated_report")
      RETURNING "id"
    ),
    "upserted_section_states" AS (
      INSERT INTO "report_section_state" (
        "report_id", "section", "state", "updated_at"
      )
      SELECT
        "updated_report"."id",
        "state_input"."section"::"report_section",
        "state_input"."state"::"report_section_decision",
        ${input.updatedAt}
      FROM "updated_report"
      CROSS JOIN jsonb_to_recordset(${sectionStates}::jsonb)
        AS "state_input"("section" text, "state" text)
      ON CONFLICT ("report_id", "section") DO UPDATE SET
        "state" = excluded."state",
        "updated_at" = excluded."updated_at"
      RETURNING "report_id"
    ),
    "inserted_anatomical_rows" AS (
      INSERT INTO "anatomical_issue" (
        "id", "type", "observation_type", "anatomical_part_id",
        "advanced_report_id", "notes", "laterality", "severity"
      )
      SELECT
        "row_input"."id",
        "row_input"."type"::"anatomical_issue_type",
        "row_input"."observation_type"::"anatomical_issue_observation_type",
        "row_input"."anatomical_part_id",
        "updated_report"."id",
        "row_input"."notes",
        "row_input"."laterality"::"laterality_type",
        "row_input"."severity"
      FROM "updated_report"
      CROSS JOIN jsonb_to_recordset(${anatomicalRows}::jsonb) AS "row_input"(
        "id" text,
        "type" text,
        "observation_type" text,
        "anatomical_part_id" text,
        "notes" text,
        "laterality" text,
        "severity" integer
      )
      RETURNING "id"
    ),
    "inserted_recommendation_rows" AS (
      INSERT INTO "advanced_report_recommendations" (
        "id", "advanced_report_id", "recommendation"
      )
      SELECT
        "row_input"."id",
        "updated_report"."id",
        "row_input"."recommendation"
      FROM "updated_report"
      CROSS JOIN jsonb_to_recordset(${recommendationRows}::jsonb)
        AS "row_input"("id" text, "recommendation" text)
      RETURNING "id"
    )
    SELECT "id", "revision" FROM "updated_report"
  `;
}
