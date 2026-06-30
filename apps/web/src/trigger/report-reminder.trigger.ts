import { schemaTask, wait } from "@trigger.dev/sdk/v3";
import z from "zod";
import React from "react";
import { resend } from "@/lib/utils/resend";
import { render } from "@react-email/components";
import { ReportReminderEmail } from "@/emails/ReportReminderEmail";
import { db } from "@/lib/utils/db";
import { advancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { organization as organizationSchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";

const reportReminderSchema = z.object({
  reportId: z.string(),
  organizationId: z.string(),
  organizationName: z.string(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  reportTitle: z.string(),
  patientName: z.string().optional(),
  reminderDate: z.string(), // ISO date string
  reminderMessage: z.string().optional(),
});

export const reportReminderTask = schemaTask({
  id: "report-reminder",
  description: "Envoie un rappel par email pour un rapport finalisé",
  schema: reportReminderSchema,
  run: async (payload) => {
    const {
      reportId,
      organizationId,
      organizationName,
      clientName,
      clientEmail,
      reportTitle,
      patientName,
      reminderDate,
      reminderMessage,
    } = payload;

    // Vérifier que l'organisation existe toujours
    const org = await db.query.organization.findFirst({
      where: eq(organizationSchema.id, organizationId),
    });

    if (!org) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    // Vérifier que le rapport existe toujours
    const report = await db.query.advancedReport.findFirst({
      where: eq(advancedReport.id, reportId),
    });

    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Calculer le délai avant l'envoi
    const reminderDateTime = new Date(reminderDate);
    const now = new Date();
    const delayMs = reminderDateTime.getTime() - now.getTime();

    if (delayMs > 0) {
      // Attendre jusqu'à la date du rappel
      await wait.until({ date: reminderDateTime });
    }

    console.log(
      `[Report Reminder] Envoi du rappel pour le rapport ${reportId} au client ${clientEmail}`,
    );

    // Générer l'email HTML
    const emailHtml = await render(
      ReportReminderEmail({
        clientName,
        organizationName,
        reportTitle,
        patientName: patientName || "votre animal",
        reminderDate: reminderDateTime,
        reminderMessage: reminderMessage || undefined,
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports/${reportId}`,
      }) as React.ReactElement,
    );

    // Envoyer l'email au client
    await resend.emails.send({
      from: "Biume <support@biume.com>",
      to: [clientEmail],
      subject: `Rappel : ${reportTitle} - Reprendre rendez-vous`,
      html: emailHtml,
    });

    console.log(
      `[Report Reminder] Rappel envoyé à ${clientEmail} pour le rapport ${reportId}`,
    );

    return {
      success: true,
      reportId,
      sentAt: new Date().toISOString(),
    };
  },
});
