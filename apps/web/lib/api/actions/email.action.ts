"use server";

import { render } from "@react-email/render";
import z from "zod";

import NewReportClientEmail from "@biume/emails/NewReportClientEmail";
import { renderOwnerReportPdf } from "#/lib/reports/owner-report-pdf";
import { resend } from "#/lib/utils/resend";

const sendNewReportClientEmailWithPDFSchema = z.object({
  to: z.string().email(),
  clientName: z.string(),
  petName: z.string(),
  reportDate: z.string(),
  reportUrl: z.string(),
  reportId: z.string(),
});

/**
 * L'action reçoit l'identifiant du compte rendu, pas le compte rendu : c'est
 * `renderOwnerReportPdf` qui le relit côté serveur. La liste des comptes
 * rendus, d'où part cet envoi, ne porte ni le motif de consultation ni les
 * `ownerContents` — le PDF construit depuis sa charge utile aurait envoyé au
 * client une version amputée, avec la formulation clinique du praticien à la
 * place du texte réécrit pour lui.
 */
export async function sendNewReportClientEmailWithPDF(
  input: z.infer<typeof sendNewReportClientEmailWithPDFSchema>,
) {
  const { to, clientName, petName, reportDate, reportUrl, reportId } =
    sendNewReportClientEmailWithPDFSchema.parse(input);

  try {
    const pdfBuffer = await renderOwnerReportPdf(reportId);

    if (!pdfBuffer) throw new Error("Compte rendu introuvable");

    const html = await render(
      NewReportClientEmail({ clientName, petName, reportDate, reportUrl }),
    );

    const { data, error } = await resend.emails.send({
      from: "Biume <noreply@biume.com>",
      to,
      subject: `Nouveau rapport disponible pour ${petName}`,
      html,
      attachments: [
        {
          filename: `rapport-${reportId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error(error, "error");
      throw new Error("Erreur lors de l'envoi de l'email");
    }

    return { success: true, data };
  } catch (error) {
    console.error(error, "error");
    throw new Error("Erreur lors de l'envoi de l'email");
  }
}
