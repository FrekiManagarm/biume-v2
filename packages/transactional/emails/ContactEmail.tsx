import { Text } from "@react-email/components";

import { EmailAction, EmailDetailRows, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface ContactEmailProps { name: string; email: string; message: string; subject?: string; }

export const ContactEmail = ({ name, email, message, subject = "Nouveau contact" }: ContactEmailProps) => <EmailLayout preview={`Message de contact de ${name} — ${subject}`}><EmailTitle eyebrow="Contact">Nouveau message de contact.</EmailTitle><EmailDetailRows rows={[{ label: "Nom", value: name }, { label: "Email", value: email }, { label: "Sujet", value: subject }]} /><Text style={bodyText}>{message}</Text><EmailAction href={`mailto:${email}`}>Répondre au message</EmailAction><EmailSupportNote>Ce message a été envoyé depuis le formulaire de contact Biume.</EmailSupportNote></EmailLayout>;

export default ContactEmail;
