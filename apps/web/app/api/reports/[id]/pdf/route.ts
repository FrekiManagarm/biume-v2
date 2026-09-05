import { renderOwnerReportPdf } from "#/lib/reports/owner-report-pdf";

export const runtime = "nodejs";

/**
 * Rend le PDF d'un compte rendu côté serveur, avec le même code que
 * `lib/api/actions/email.action.ts` (`renderOwnerReportPdf`).
 *
 * `renderOwnerReportPdf` relit le compte rendu via `getReportById`, qui scope
 * déjà la lecture à l'organisation courante (`functions/reports.function.ts`) :
 * un compte rendu introuvable pour cette organisation — qu'il n'existe pas ou
 * qu'il appartienne à une autre entreprise — ressort en `null`, jamais comme
 * une erreur. Un document médical ne doit jamais être servi à qui n'a pas le
 * droit de le lire : ce cas répond 404, pas 200.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pdfBuffer = await renderOwnerReportPdf(id);

  if (!pdfBuffer) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${id}.pdf"`,
    },
  });
}
