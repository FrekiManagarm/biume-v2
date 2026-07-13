import { Text } from "@react-email/components";

import { EmailAction, EmailCard, EmailFallbackUrl, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface AskMedicalRecordAccessProps { ownerName: string; animalName: string; accessLink: string; proName: string; justification: string; }

const AskMedicalRecordAccess = ({ ownerName, animalName, accessLink, proName, justification }: AskMedicalRecordAccessProps) => <EmailLayout tone="security" preview={`Demande d’accès au dossier médical de ${animalName}`}><EmailTitle eyebrow="Accès au dossier">Autorisez l’accès au dossier médical.</EmailTitle><Text style={bodyText}>Bonjour {ownerName},</Text><Text style={bodyText}>{proName} demande votre autorisation pour consulter le dossier médical complet de {animalName} afin d’assurer un suivi adapté.</Text><EmailCard title="MOTIF DE LA DEMANDE">{justification}</EmailCard><EmailAction href={accessLink} tone="ink">Autoriser l’accès au dossier</EmailAction><EmailFallbackUrl href={accessLink} /><EmailSupportNote>Vous ne souhaitez pas autoriser cet accès ? Ignorez simplement cet email.</EmailSupportNote></EmailLayout>;

export default AskMedicalRecordAccess;
