import { renderToBuffer } from "@react-pdf/renderer";

import { OwnerReportPDF } from "#/components/dashboard/pages/reports-module/components/ReportPDF.owner";
import { getReportById } from "#/functions/reports.function";

/**
 * Source unique du compte rendu propriétaire : la route de téléchargement et
 * l'envoi par email doivent produire exactement le même document.
 *
 * Le compte rendu est relu ici plutôt que reçu de l'appelant, parce que c'est
 * la lecture serveur qui porte `ownerContents` — le texte réécrit pour le
 * propriétaire. Rendre le PDF depuis la charge utile d'un composant client
 * enverrait au client la formulation clinique du praticien.
 *
 * `getReportById` scope déjà la lecture à l'organisation courante : un compte
 * rendu introuvable pour cette entreprise ressort en `null`, et un document
 * médical ne doit jamais être servi à qui n'a pas le droit de le lire.
 */
export async function renderOwnerReportPdf(
  reportId: string,
): Promise<Buffer | null> {
  const result = await getReportById({ reportId });

  if (!result.success || !result.data) return null;

  const report = result.data;

  return renderToBuffer(
    OwnerReportPDF({
      report: {
        id: report.id,
        title: report.title,
        createdAt: report.createdAt || new Date(),
        consultationReason: report.consultationReason,
        notes: report.notes,
        patient: report.patient,
        organization: report.organization,
        anatomicalIssues: report.anatomicalIssues,
        recommendations: report.recommendations,
        ownerContents: report.ownerContents,
      },
      type: "advanced_report",
    }),
  );
}
