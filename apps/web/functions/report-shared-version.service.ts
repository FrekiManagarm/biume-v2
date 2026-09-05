import type {
  OwnerReportSnapshot,
  OwnerSourceKind,
  ReportSectionId,
  ReportSectionState,
} from "@biume/contracts/report";
import type { ReportSharedVersion } from "@biume/db/schema/index";
import {
  assertReportCanBeShared,
  buildOwnerReportSnapshot,
  normalizeReportSectionStates,
  resolveOwnerFacingText,
} from "./report-domain";

export type TenantOwnedReportForSharing = {
  id: string;
  revision: number;
  status: "draft" | "finalized" | "sent";
  title: string;
  consultationReason: string;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    owner: { id: string; name: string | null } | null;
  } | null;
  anatomicalIssues: Array<{
    id: string;
    type: "observation" | "dysfunction" | "anatomicalSuspicion";
    notes: string | null;
    anatomicalPart: { name: string } | null;
  }>;
  recommendations: Array<{ id: string; recommendation: string }>;
  ownerContents: Array<{
    sourceKind: OwnerSourceKind;
    sourceId: string;
    ownerText: string;
  }>;
  sectionStates: Array<{
    section: ReportSectionId;
    state: ReportSectionState;
  }>;
};

type TenantReportScope = {
  organizationId: string;
  reportId: string;
};

type SharedVersionKey = TenantReportScope & {
  reportRevision: number;
};

type SharedVersionInsert = SharedVersionKey & {
  snapshot: OwnerReportSnapshot;
};

export type ReportSharedVersionPorts = {
  loadTenantOwnedReport: (
    scope: TenantReportScope,
  ) => Promise<TenantOwnedReportForSharing | null | undefined>;
  findExistingVersion: (
    key: SharedVersionKey,
  ) => Promise<ReportSharedVersion | null | undefined>;
  insertImmutableVersion: (
    version: SharedVersionInsert,
  ) => Promise<ReportSharedVersion | undefined>;
  findVersionAfterConflict: (
    key: SharedVersionKey,
  ) => Promise<ReportSharedVersion | null | undefined>;
};

export async function createImmutableReportSharedVersion(
  request: TenantReportScope & { createdAt: Date },
  ports: ReportSharedVersionPorts,
) {
  const scope = {
    organizationId: request.organizationId,
    reportId: request.reportId,
  };
  const report = await ports.loadTenantOwnedReport(scope);
  if (!report?.patient?.owner) {
    throw new Error("Rapport, animal ou propriétaire introuvable");
  }

  const sectionStates = normalizeReportSectionStates(report.sectionStates);
  assertReportCanBeShared(report.status, sectionStates);

  const key = {
    ...scope,
    reportRevision: report.revision,
  };
  const existing = await ports.findExistingVersion(key);
  if (existing) return existing;

  const itemText = (item: {
    notes: string | null;
    anatomicalPart: { name: string } | null;
  }) => item.notes?.trim() || item.anatomicalPart?.name.trim() || "";
  const isOwnerSectionIncluded = (section: ReportSectionId) =>
    sectionStates[section] !== "not_applicable";
  const snapshot = buildOwnerReportSnapshot({
    reportId: report.id,
    reportRevision: report.revision,
    title: report.title,
    animal: { id: report.patient.id, name: report.patient.name },
    owner: { id: report.patient.owner.id, name: report.patient.owner.name },
    consultationReason: isOwnerSectionIncluded("clinical")
      ? resolveOwnerFacingText(
          report.ownerContents,
          "consultationReason",
          "consultationReason",
          report.consultationReason,
        )
      : "",
    clinical: isOwnerSectionIncluded("clinical")
      ? report.anatomicalIssues
          .filter((item) => item.type === "observation")
          .map((item) =>
            resolveOwnerFacingText(
              report.ownerContents,
              "observation",
              item.id,
              itemText(item),
            ),
          )
          .filter(Boolean)
      : [],
    anatomical: isOwnerSectionIncluded("anatomical")
      ? report.anatomicalIssues
          .filter((item) =>
            ["dysfunction", "anatomicalSuspicion"].includes(item.type),
          )
          .map((item) =>
            resolveOwnerFacingText(
              report.ownerContents,
              "anatomicalIssue",
              item.id,
              itemText(item),
            ),
          )
          .filter(Boolean)
      : [],
    recommendations: isOwnerSectionIncluded("recommendations")
      ? report.recommendations
          .map((item) =>
            resolveOwnerFacingText(
              report.ownerContents,
              "recommendation",
              item.id,
              item.recommendation,
            ),
          )
          .filter(Boolean)
      : [],
    notes: isOwnerSectionIncluded("notes")
      ? resolveOwnerFacingText(
          report.ownerContents,
          "notes",
          "notes",
          report.notes ?? "",
        )
      : "",
    createdAt: request.createdAt,
  });

  const created = await ports.insertImmutableVersion({ ...key, snapshot });
  if (created) return created;

  const persisted = await ports.findVersionAfterConflict(key);
  if (!persisted) throw new Error("Impossible de créer la version partagée");
  return persisted;
}
