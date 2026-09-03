/**
 * Le courriel ne porte aucun contenu clinique : un lien, un prénom d'animal.
 * La page propriétaire demandera un code avant de montrer quoi que ce soit.
 */
export async function sendNewReportEmail(input: {
  to: string;
  clientName: string;
  petName: string;
  reportDate: string;
  token: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const { env } = await import("@biume/env/server");
  const { default: NewReportClientEmail } = await import(
    "@biume/emails/NewReportClientEmail"
  );

  await new Resend(env.RESEND_API_KEY).emails.send({
    from: "Biume <no-reply@biume.app>",
    to: input.to,
    subject: `Le compte rendu de ${input.petName} est disponible`,
    react: NewReportClientEmail({
      clientName: input.clientName,
      petName: input.petName,
      reportDate: input.reportDate,
      reportUrl: `${env.APP_URL}/r/${input.token}`,
    }),
  });
}
