import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { db } from "#/lib/utils/db";
import { getCurrentOrganization } from "#/functions/auth.function";
import { reportReminderTask } from "#/trigger/report-reminder.trigger";
import { advancedReport } from "#/lib/schemas/advancedReport/advancedReport";

const scheduleReminderSchema = z.object({
  reportId: z.string(),
  reminderDate: z.string(),
  reminderMessage: z.string().optional(),
});

const scheduleReportReminderFn = createServerFn({ method: "POST" })
  .validator(scheduleReminderSchema)
  .handler(async ({ data }) => {
    try {
      const { reportId, reminderDate, reminderMessage } = data;

      const organization = await getCurrentOrganization();
      if (!organization) {
        throw new Error("Organization not found");
      }

      const report = await db.query.advancedReport.findFirst({
        where: and(
          eq(advancedReport.id, reportId),
          eq(advancedReport.createdBy, organization.id),
        ),
        with: {
          patient: {
            columns: {
              name: true,
            },
            with: {
              owner: {
                columns: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!report) {
        throw new Error("Report not found or unauthorized");
      }

      if (!report.patient?.owner?.email) {
        throw new Error(
          "Le client associé à ce rapport n'a pas d'adresse email. Veuillez ajouter une adresse email au client avant de programmer un rappel.",
        );
      }

      const reminderDateTime = new Date(reminderDate);
      const now = new Date();
      if (reminderDateTime <= now) {
        throw new Error("La date du rappel doit être dans le futur");
      }

      const taskHandle = await reportReminderTask.trigger({
        reportId: report.id,
        organizationId: organization.id,
        organizationName: organization.name,
        clientName: report.patient.owner.name || "Client",
        clientEmail: report.patient.owner.email,
        reportTitle: report.title,
        patientName: report.patient?.name,
        reminderDate: reminderDateTime.toISOString(),
        reminderMessage: reminderMessage || undefined,
      });

      console.log(
        `[Report Reminder Action] Rappel programmé avec l'ID : ${taskHandle.id}`,
      );

      return {
        success: true,
        taskId: taskHandle.id,
        reminderDate: reminderDateTime.toISOString(),
      };
    } catch (error) {
      console.error(
        `[Report Reminder Action] Erreur lors de la programmation du rappel :`,
        error,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

export function scheduleReportReminder(
  data: z.infer<typeof scheduleReminderSchema>,
) {
  return scheduleReportReminderFn({ data });
}
