import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";
interface TrialFollowUpEmailProps { organizationName: string; trialEndDate: Date; daysRemaining: number; contactEmail: string; }
export const TrialFollowUpEmail = ({ organizationName, trialEndDate = new Date(), daysRemaining, contactEmail }: TrialFollowUpEmailProps) => <EmailLayout preview={`Comment se passe votre expérience Biume ? ${daysRemaining} jours restants`}><EmailTitle eyebrow="Votre essai">Comment se passe votre expérience ?</EmailTitle><Text style={bodyText}>Bonjour {organizationName}, il vous reste {daysRemaining} jours pour découvrir Biume, jusqu’au {format(trialEndDate, "d MMMM yyyy", { locale: fr })}.</Text><EmailInfoCard title="POUR BIEN DÉMARRER">Configurez votre agenda, ajoutez vos clients et explorez les rapports professionnels.</EmailInfoCard><EmailAction href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>Continuer à explorer Biume</EmailAction><EmailSupportNote email={contactEmail}>Notre équipe est disponible si vous avez besoin d’aide.</EmailSupportNote></EmailLayout>;
export default TrialFollowUpEmail;
