import { internalGet } from "#/lib/http/internal-fetch";
import type {
  AdvancedReportListItem,
  GetAllReportsParams,
} from "#/functions/reports.function";
import type { anatomicalIssueSchema } from "#/lib/utils/schemas";
import type { z } from "zod";

export type { AdvancedReportListItem, GetAllReportsParams } from "#/functions/reports.function";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà.
export {
  createQuickReport,
  createReport,
  createReportSharedVersion,
  deleteReport,
  seedAnatomicalParts,
  updateReport,
} from "./reports.mutations";

// Règle à respecter dans ce fichier : tout import venant de `*.function.ts`
// y reste en position de type (`import type`, ou `typeof import(...)`
// ci-dessous). C'est ce qui garde `db`, `next/headers` et le reste des
// dépendances serveur de la fonction pure hors du bundle client — un import
// de valeur (`import { getAllReports } from "#/functions/reports.function"`)
// romprait cette propriété sans qu'aucun test ne le signale. `reports.action.ts`
// est importé par neuf composants client : c'est précisément ce qui est en jeu.
export function getAllReports(
  params: GetAllReportsParams = {},
): Promise<AdvancedReportListItem[]> {
  return internalGet<AdvancedReportListItem[]>("/api/internal/reports", params);
}

type ReportDetailResult = Awaited<
  ReturnType<typeof import("#/functions/reports.function").getReportById>
>;

export function getReportById({ reportId }: { reportId: string }) {
  return internalGet<ReportDetailResult>(
    `/api/internal/reports/${encodeURIComponent(reportId)}`,
  );
}

type AnatomicalPartsResult = Awaited<
  ReturnType<typeof import("#/functions/reports.function").getAnatomicalParts>
>;

export function getAnatomicalParts(data: z.infer<typeof anatomicalIssueSchema>) {
  return internalGet<AnatomicalPartsResult>("/api/internal/anatomical-parts", data);
}

type AnatomicalHistoryResult = Awaited<
  ReturnType<
    typeof import("#/functions/reports.function").getPatientAnatomicalHistory
  >
>;

export function getPatientAnatomicalHistory(data: {
  petId: string;
  anatomicalPartId: string;
  type?: "dysfunction" | "anatomicalSuspicion" | "observation";
}) {
  return internalGet<AnatomicalHistoryResult>(
    `/api/internal/patients/${encodeURIComponent(data.petId)}/anatomical-history`,
    { anatomicalPartId: data.anatomicalPartId, type: data.type },
  );
}
