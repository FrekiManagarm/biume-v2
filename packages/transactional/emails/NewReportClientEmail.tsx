import { Text } from "@react-email/components";

import { EmailAction, EmailDetailRows, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface NewReportClientEmailProps { clientName: string; reportDate: string; reportUrl: string; petName: string; }

const NewReportClientEmail = ({ clientName = "cher client", reportDate = "aujourd’hui", reportUrl = "https://biume.com/reports", petName = "votre animal" }: Partial<NewReportClientEmailProps>) => <EmailLayout preview={`Nouveau rapport disponible pour ${petName}`}><EmailTitle eyebrow="Rapport">Le rapport de {petName} est disponible.</EmailTitle><Text style={bodyText}>Bonjour {clientName}, un nouveau rapport a été généré le {reportDate}.</Text><EmailDetailRows rows={[{ label: "Animal", value: petName }, { label: "Date", value: reportDate }]} /><EmailAction href={reportUrl}>Consulter le rapport</EmailAction><EmailSupportNote>Pour toute question sur ce rapport, contactez votre professionnel.</EmailSupportNote></EmailLayout>;

export default NewReportClientEmail;
