import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";
interface TrialReminderEmailProps { organizationName: string; trialEndDate: Date; daysRemaining: number; contactEmail: string; upgradeUrl: string; }
const TrialReminderEmail = ({ organizationName, trialEndDate, daysRemaining, contactEmail = "support@biume.com", upgradeUrl }: TrialReminderEmailProps) => <EmailLayout preview={`Votre essai Biume continue — ${daysRemaining} jours restants`}><EmailTitle eyebrow="Votre espace Biume">Votre essai continue.</EmailTitle><Text style={bodyText}>Bonjour {organizationName}, il vous reste {daysRemaining} jours pour profiter de Biume.</Text><EmailInfoCard title="RAPPEL IMPORTANT">Aucun débit n’a encore été effectué. Votre essai se termine le {format(trialEndDate, "d MMMM yyyy", { locale: fr })}.</EmailInfoCard><EmailAction href={upgradeUrl}>Gérer mon abonnement</EmailAction><EmailSupportNote email={contactEmail}>Notre équipe est là pour vous accompagner.</EmailSupportNote></EmailLayout>;
export default TrialReminderEmail;
