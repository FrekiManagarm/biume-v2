import {
  canFinalizeReport,
  type ReportSectionId,
  type ReportSectionState,
  type ReportStatus,
} from "@biume/contracts/report";
import type { FinalizeReportResponse } from "@biume/contracts/proposal";

import { normalizeReportSectionStates } from "#/functions/report-domain";
import { MobileRequestError } from "./mobile-api.errors";

export type ReportScope = { organizationId: string; reportId: string };

export type FinalizableReport = {
  id: string;
  status: ReportStatus;
  sectionStates: Array<{ section: ReportSectionId; state: ReportSectionState }>;
  patient: {
    name: string;
    owner: { id: string; name: string | null; email: string | null } | null;
  } | null;
};

export type FinalizeReportPorts = {
  loadReport(scope: ReportScope): Promise<FinalizableReport | null>;
  markStatus(scope: ReportScope, status: "finalized" | "sent", at: Date): Promise<void>;
  createSharedVersion(scope: ReportScope, at: Date): Promise<{ id: string }>;
  findActiveLink(input: { sharedVersionId: string; ownerId: string }): Promise<{ token: string } | null>;
  insertLink(input: { token: string; sharedVersionId: string; ownerId: string }): Promise<void>;
  generateToken(): string;
  sendEmail(input: {
    to: string;
    clientName: string;
    petName: string;
    reportDate: string;
    token: string;
  }): Promise<void>;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeZone: "Europe/Paris",
});

/**
 * Un seul geste, en étapes ordonnées et chacune idempotente : rejouer la
 * finalisation après une coupure ne crée ni seconde version, ni second lien,
 * ni second e-mail sur un rapport déjà « envoyé ».
 */
export async function finalizeReport(
  request: ReportScope & { sendToOwner: boolean; now: Date },
  ports: FinalizeReportPorts,
): Promise<FinalizeReportResponse> {
  const scope = { organizationId: request.organizationId, reportId: request.reportId };
  const report = await ports.loadReport(scope);
  if (!report) throw new MobileRequestError("not_found");

  const states = normalizeReportSectionStates(report.sectionStates);
  if (!canFinalizeReport(states)) throw new MobileRequestError("validation");

  const owner = report.patient?.owner;
  if (!report.patient || !owner) throw new MobileRequestError("conflict");

  if (report.status === "draft") {
    await ports.markStatus(scope, "finalized", request.now);
  }

  const version = await ports.createSharedVersion(scope, request.now);

  const existing = await ports.findActiveLink({ sharedVersionId: version.id, ownerId: owner.id });
  const token = existing?.token ?? ports.generateToken();
  if (!existing) {
    await ports.insertLink({ token, sharedVersionId: version.id, ownerId: owner.id });
  }

  const canSend = request.sendToOwner && owner.email !== null && report.status !== "sent";
  if (canSend) {
    await ports.sendEmail({
      to: owner.email as string,
      clientName: owner.name ?? "cher client",
      petName: report.patient.name,
      reportDate: dateFormatter.format(request.now),
      token,
    });
    await ports.markStatus(scope, "sent", request.now);
  }

  const status: ReportStatus = canSend || report.status === "sent" ? "sent" : "finalized";
  return { reportId: request.reportId, status, sentToOwner: canSend };
}
