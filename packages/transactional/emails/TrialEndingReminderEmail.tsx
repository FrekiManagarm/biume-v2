import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";
interface TrialEndingReminderEmailProps { organizationName: string; trialEndDate: Date; daysRemaining: number; contactEmail: string; upgradeUrl: string; cancelUrl: string; }
const TrialEndingReminderEmail = ({ organizationName, trialEndDate, daysRemaining, contactEmail = "support@biume.com", upgradeUrl, cancelUrl }: TrialEndingReminderEmailProps) => <EmailLayout preview={`Votre essai Biume se termine dans ${daysRemaining} jours`}><EmailTitle eyebrow="Votre espace Biume">Votre essai se termine {daysRemaining === 1 ? "demain" : `dans ${daysRemaining} jours`}.</EmailTitle><Text style={bodyText}>Bonjour {organizationName}, votre période d’essai se termine le {format(trialEndDate, "d MMMM yyyy", { locale: fr })}.</Text><EmailInfoCard title="CHOISISSEZ LA SUITE">Vous pouvez continuer avec un abonnement ou annuler avant la fin de l’essai.</EmailInfoCard><EmailAction href={upgradeUrl}>Choisir mon abonnement</EmailAction><EmailAction href={cancelUrl} tone="ink">Gérer mon essai</EmailAction><EmailSupportNote email={contactEmail}>Nous restons disponibles pour toute question.</EmailSupportNote></EmailLayout>;
export default TrialEndingReminderEmail;
