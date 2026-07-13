import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";
interface TrialEndingOrgProps { organizationName: string; trialEndDate: Date; daysRemaining: number; contactEmail: string; upgradeUrl: string; }
export const TrialEndingOrg = ({ organizationName, trialEndDate, daysRemaining, contactEmail, upgradeUrl }: TrialEndingOrgProps) => <EmailLayout preview={`Votre essai Biume se termine dans ${daysRemaining} jours`}><EmailTitle eyebrow="Votre espace Biume">Votre période d’essai se termine bientôt.</EmailTitle><Text style={bodyText}>Bonjour {organizationName}, votre essai se termine dans {daysRemaining} jours, le {format(trialEndDate, "d MMMM yyyy", { locale: fr })}.</Text><EmailInfoCard title="CONSERVER VOTRE ESPACE">Passez à un abonnement pour conserver l’accès à vos outils et à vos données.</EmailInfoCard><EmailAction href={upgradeUrl}>Choisir mon abonnement</EmailAction><EmailSupportNote email={contactEmail}>Notre équipe peut vous aider à choisir l’offre adaptée.</EmailSupportNote></EmailLayout>;
export default TrialEndingOrg;
