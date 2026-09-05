/**
 * Le courriel de code ne contient **que** le code et sa durée de validité :
 * ni nom d'animal, ni contenu de compte rendu, ni lien menant directement au
 * rapport. Une boîte mail compromise ne doit pas suffire.
 */
export async function sendOwnerAccessCode(input: {
  email: string;
  code: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const { env } = await import("@biume/env/server");
  const { OwnerAccessCodeEmail } = await import(
    "@biume/emails/OwnerAccessCodeEmail"
  );

  await new Resend(env.RESEND_API_KEY).emails.send({
    from: "Biume <no-reply@biume.app>",
    to: input.email,
    subject: "Votre code d'accès Biume",
    react: OwnerAccessCodeEmail({ code: input.code }),
  });
}
