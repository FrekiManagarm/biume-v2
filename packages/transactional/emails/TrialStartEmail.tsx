import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailSuccessCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";
interface TrialStartEmailProps { organizationName: string; trialEndDate: Date; contactEmail: string; }
export const TrialStartEmail = ({ organizationName, trialEndDate = new Date(), contactEmail }: TrialStartEmailProps) => <EmailLayout preview="Bienvenue dans votre période d’essai gratuite Biume"><EmailTitle eyebrow="Votre espace Biume">Tout est prêt pour démarrer.</EmailTitle><Text style={bodyText}>Bonjour {organizationName}, merci de faire confiance à Biume.</Text><EmailSuccessCard title="VOTRE ESSAI GRATUIT EST ACTIVÉ">Vous profitez de toutes les fonctionnalités jusqu’au {format(trialEndDate, "d MMMM yyyy", { locale: fr })}, sans prélèvement pendant l’essai.</EmailSuccessCard><EmailAction href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>Accéder à mon espace</EmailAction><EmailSupportNote email={contactEmail}>Une question ? Notre équipe est là pour vous accompagner.</EmailSupportNote></EmailLayout>;
export default TrialStartEmail;
