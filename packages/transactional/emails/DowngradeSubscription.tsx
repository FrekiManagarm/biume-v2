import { Text } from "@react-email/components";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

const DowngradeSubscription = ({ plan }: { plan: string }) => <EmailLayout preview="Votre abonnement Biume a été mis à jour"><EmailTitle eyebrow="Abonnement">Votre offre a été modifiée.</EmailTitle><Text style={bodyText}>Votre abonnement a été modifié pour l’offre {plan}. Ce changement est effectif immédiatement.</Text><EmailInfoCard title="CE QUI CHANGE">Votre facturation sera ajustée. Vos données et les fonctionnalités incluses dans votre nouvelle offre restent disponibles.</EmailInfoCard><EmailAction href="https://biume.com/support">Contacter le support</EmailAction><EmailSupportNote>Merci de faire confiance à Biume.</EmailSupportNote></EmailLayout>;

export default DowngradeSubscription;
