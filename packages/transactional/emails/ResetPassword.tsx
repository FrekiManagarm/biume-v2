import { Text } from "@react-email/components";

import { EmailAction, EmailFallbackUrl, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

type ResetPasswordProps = { resetLink?: string; username?: string };

export function ResetPassword({ resetLink = "https://biume.com/reset-password", username = "there" }: ResetPasswordProps) {
  return <EmailLayout tone="security" preview="Réinitialisez votre mot de passe Biume"><EmailTitle eyebrow="Sécurité">Réinitialisez votre mot de passe.</EmailTitle><Text style={bodyText}>Bonjour {username},</Text><Text style={bodyText}>Une demande de réinitialisation vient d’être reçue pour votre compte Biume.</Text><EmailInfoCard title="POUR VOTRE SÉCURITÉ">Ce lien est personnel et expire dans 24 heures.</EmailInfoCard><EmailAction href={resetLink} tone="ink">Réinitialiser mon mot de passe</EmailAction><EmailFallbackUrl href={resetLink} /><EmailSupportNote>Vous n’êtes pas à l’origine de cette demande ? Ignorez simplement cet email.</EmailSupportNote></EmailLayout>;
}
