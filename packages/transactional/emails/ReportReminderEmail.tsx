import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailCard, EmailDetailRows, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface ReportReminderEmailProps { clientName: string; organizationName: string; reportTitle: string; patientName: string; reminderDate: Date; reminderMessage?: string; reportUrl: string; }

export const ReportReminderEmail = ({ clientName, organizationName, reportTitle, patientName, reminderDate, reminderMessage, reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports` }: ReportReminderEmailProps) => <EmailLayout preview={`Rappel : ${reportTitle}`}><EmailTitle eyebrow="Rappel">Il est temps de reprendre rendez-vous.</EmailTitle><Text style={bodyText}>Bonjour {clientName}, {organizationName} vous invite à prévoir le prochain suivi de {patientName}.</Text><EmailDetailRows rows={[{ label: "Rapport", value: reportTitle }, { label: "Date du rappel", value: format(reminderDate, "d MMMM yyyy à HH:mm", { locale: fr }) }]} />{reminderMessage ? <EmailCard title={`MESSAGE DE ${organizationName.toUpperCase()}`}>{reminderMessage}</EmailCard> : null}<EmailAction href={reportUrl}>Consulter le rapport</EmailAction><EmailSupportNote>Pour organiser ce rendez-vous, contactez directement {organizationName}.</EmailSupportNote></EmailLayout>;

export default ReportReminderEmail;
