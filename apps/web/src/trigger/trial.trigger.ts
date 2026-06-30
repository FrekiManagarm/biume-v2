import { schemaTask, wait } from "@trigger.dev/sdk/v3";
import z from "zod";
import React from "react";
import { resend } from "@/lib/utils/resend";
import { render } from "@react-email/components";
import { TrialStartEmail } from "@/emails/TrialStartEmail";
import { TrialFollowUpEmail } from "@/emails/TrialFollowUpEmail";
import { TrialEndingReminderEmail } from "@/emails/TrialEndingReminderEmail";
import { db } from "@/lib/utils/db";
import { organization as organizationSchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";

const trialWorkflowSchema = z.object({
  organizationId: z.string(),
  organizationName: z.string(),
  organizationEmail: z.string(),
  trialStart: z.string(),
  trialEnd: z.string(),
});

export const trialWorkflow = schemaTask({
  id: "trial-workflow",
  description:
    "Gère le workflow de la période d'essai avec 4 emails programmés",
  schema: trialWorkflowSchema,
  run: async (payload) => {
    const {
      organizationId,
      organizationName,
      organizationEmail,
      trialStart,
      trialEnd,
    } = payload;

    const trialEndDate = new Date(trialEnd);
    const contactEmail = "support@biume.com";
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`;

    // Vérifier que l'organisation existe toujours
    const org = await db.query.organization.findFirst({
      where: eq(organizationSchema.id, organizationId),
    });

    if (!org) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    // Email 1 : Bienvenue et début de la période d'essai (immédiat)
    console.log(
      `[Trial Workflow] Envoi de l'email de bienvenue pour ${organizationName}`,
    );

    const welcomeEmailHtml = await render(
      TrialStartEmail({
        organizationName,
        trialEndDate,
        contactEmail,
      }) as React.ReactElement,
    );

    await resend.emails.send({
      from: "Biume <onboarding@biume.com>",
      to: [organizationEmail],
      subject: `Bienvenue sur Biume - Votre période d'essai a commencé !`,
      html: welcomeEmailHtml,
    });

    console.log(
      `[Trial Workflow] Email de bienvenue envoyé à ${organizationEmail}`,
    );

    // Attendre 5 jours
    await wait.for({ days: 5 });

    // Email 2 : Suivi et trucs & astuces (J+5, 10 jours restants)
    console.log(
      `[Trial Workflow] Envoi de l'email de suivi pour ${organizationName}`,
    );

    const followUpEmailHtml = await render(
      TrialFollowUpEmail({
        organizationName,
        trialEndDate,
        daysRemaining: 10,
        contactEmail,
      }) as React.ReactElement,
    );

    await resend.emails.send({
      from: "Biume <support@biume.com>",
      to: [organizationEmail],
      subject: `Comment se passe votre expérience Biume ? 10 jours restants`,
      html: followUpEmailHtml,
    });

    console.log(
      `[Trial Workflow] Email de suivi envoyé à ${organizationEmail}`,
    );

    // Attendre 5 jours supplémentaires (total : 10 jours)
    await wait.for({ days: 5 });

    // Email 3 : Premier rappel (J+10, 5 jours restants)
    console.log(
      `[Trial Workflow] Envoi du premier rappel pour ${organizationName}`,
    );

    const firstReminderHtml = await render(
      TrialEndingReminderEmail({
        organizationName,
        trialEndDate,
        daysRemaining: 5,
        contactEmail,
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
        cancelUrl,
      }) as React.ReactElement,
    );

    await resend.emails.send({
      from: "Biume <support@biume.com>",
      to: [organizationEmail],
      subject: `Votre période d'essai Biume se termine dans 5 jours`,
      html: firstReminderHtml,
    });

    console.log(
      `[Trial Workflow] Premier rappel envoyé à ${organizationEmail}`,
    );

    // Attendre 4 jours supplémentaires (total : 14 jours)
    await wait.for({ days: 4 });

    // Email 4 : Alerte finale (J+14, 1 jour restant)
    console.log(
      `[Trial Workflow] Envoi de l'alerte finale pour ${organizationName}`,
    );

    const finalAlertHtml = await render(
      TrialEndingReminderEmail({
        organizationName,
        trialEndDate,
        daysRemaining: 1,
        contactEmail,
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
        cancelUrl,
      }) as React.ReactElement,
    );

    await resend.emails.send({
      from: "Biume <support@biume.com>",
      to: [organizationEmail],
      subject: `⚠️ Votre période d'essai Biume se termine demain`,
      html: finalAlertHtml,
    });

    console.log(
      `[Trial Workflow] Alerte finale envoyée à ${organizationEmail}`,
    );
    console.log(`[Trial Workflow] Workflow terminé pour ${organizationName}`);

    return {
      success: true,
      organizationId,
      emailsSent: 4,
    };
  },
});
