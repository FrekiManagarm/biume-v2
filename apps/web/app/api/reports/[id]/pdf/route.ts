import { renderToBuffer } from "@react-pdf/renderer";

import { ReportPDF } from "#/components/dashboard/pages/reports-module/components/ReportPDF";
import { getReportById } from "#/functions/reports.function";

export const runtime = "nodejs";

/**
 * Rend le PDF d'un compte rendu côté serveur, avec le même code que
 * `lib/api/actions/email.action.ts` (`renderToBuffer(<ReportPDF />)`).
 *
 * `getReportById` scope déjà la lecture à l'organisation courante
 * (`functions/reports.function.ts`) : un compte rendu introuvable pour cette
 * organisation — qu'il n'existe pas ou qu'il appartienne à une autre
 * entreprise — ressort comme `{ success: false, data: null }`, jamais comme
 * une erreur. Un document médical ne doit jamais être servi à qui n'a pas le
 * droit de le lire : ce cas répond 404, pas 200.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await getReportById({ reportId: id });

  if (!result.success || !result.data) {
    return new Response(null, { status: 404 });
  }

  const report = result.data;

  const pdfBuffer = await renderToBuffer(
    ReportPDF({
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

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${report.id}.pdf"`,
    },
  });
}
