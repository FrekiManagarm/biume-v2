import { MobileRequestError } from "./mobile-api.errors";

/**
 * Le SDK Resend **ne lève pas** : toute réponse non-2xx revient en
 * `{ data: null, error }`. Ignorer ce retour ferait passer une clé expirée, une
 * adresse rejetée ou un 500 du fournisseur pour un envoi réussi ; le rapport
 * serait marqué « envoyé », et la garde qui empêche les doublons interdirait
 * alors tout renvoi. Le propriétaire ne recevrait jamais rien, et aucun rejeu
 * ne le réparerait.
 */
function reportEmailFailure(statusCode: number | null): never {
  // Ni le message, ni le nom d'erreur, ni quoi que ce soit du corps du
  // fournisseur : seulement de quoi savoir s'il vaut la peine de réessayer.
  const retryable = statusCode === null || statusCode === 429 || statusCode >= 500;
  throw new MobileRequestError("server_error", { retryable });
}

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
  idempotencyKey: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const { env } = await import("@biume/env/server");
  const { default: NewReportClientEmail } = await import(
    "@biume/emails/NewReportClientEmail"
  );

  const { error } = await new Resend(env.RESEND_API_KEY).emails.send(
    {
      from: "Biume <no-reply@biume.app>",
      to: input.to,
      subject: `Le compte rendu de ${input.petName} est disponible`,
      react: NewReportClientEmail({
        clientName: input.clientName,
        petName: input.petName,
        reportDate: input.reportDate,
        reportUrl: `${env.APP_URL}/r/${input.token}`,
      }),
    },
    // Dérivée du rapport et de sa version figée : un rejeu après une coupure
    // rejoue exactement la même clé, et le fournisseur n'expédie qu'une fois.
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) reportEmailFailure(error.statusCode);
}
