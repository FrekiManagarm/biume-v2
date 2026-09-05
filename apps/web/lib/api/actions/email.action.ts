"use server";

import { render } from "@react-email/render";
import { renderToBuffer } from "@react-pdf/renderer";
import z from "zod";

import NewReportClientEmail from "@biume/emails/NewReportClientEmail";
import { ReportPDF } from "#/components/dashboard/pages/reports-module/components/ReportPDF";
import { resend } from "#/lib/utils/resend";
import type { AdvancedReportListItem } from "#/functions/reports.function";

const sendNewReportClientEmailWithPDFSchema = z.object({
  to: z.string().email(),
  clientName: z.string(),
  petName: z.string(),
  reportDate: z.string(),
  reportUrl: z.string(),
  report: z.any(),
});

export async function sendNewReportClientEmailWithPDF(
  input: z.infer<typeof sendNewReportClientEmailWithPDFSchema>,
) {
  const params = sendNewReportClientEmailWithPDFSchema.parse(input);
  const { to, clientName, petName, reportDate, reportUrl, report } =
    params as z.infer<typeof sendNewReportClientEmailWithPDFSchema> & {
      report: Pick<
        AdvancedReportListItem,
        | "id"
        | "title"
        | "createdAt"
        | "patient"
        | "organization"
        | "anatomicalIssues"
        | "recommendations"
      >;
    };

  try {
    const html = await render(
      NewReportClientEmail({ clientName, petName, reportDate, reportUrl }),
    );

    const pdfBuffer = await renderToBuffer(
      ReportPDF({
        report: {
          id: report.id,
          title: report.title,
          createdAt: report.createdAt || new Date(),
          patient: report.patient,
          organization: report.organization,
          anatomicalIssues: report.anatomicalIssues,
          recommendations: report.recommendations,
        },
        type: "advanced_report",
      }),
    );

    const { data, error } = await resend.emails.send({
      from: "Biume <noreply@biume.com>",
      to,
      subject: `Nouveau rapport disponible pour ${petName}`,
      html,
      attachments: [
        {
          filename: `rapport-${report.id}.pdf`,
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
