import { Text } from "@react-email/components";
import { EmailAction, EmailDetailRows, EmailSuccessCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

const UpgradeSubscription = ({ plan, price }: { plan: string; price: string }) => <EmailLayout preview="Votre abonnement Biume a été mis à jour"><EmailTitle eyebrow="Abonnement">Bienvenue dans l’offre {plan}.</EmailTitle><Text style={bodyText}>Votre abonnement a bien été mis à jour. Toutes les fonctionnalités de votre offre sont maintenant disponibles.</Text><EmailSuccessCard title="ABONNEMENT CONFIRMÉ">Votre changement d’offre est effectif.</EmailSuccessCard><EmailDetailRows rows={[{ label: "Offre", value: plan }, { label: "Prix", value: `${price} €/mois` }]} /><EmailAction href="https://biume.com/dashboard">Ouvrir mon espace</EmailAction><EmailSupportNote>Besoin d’aide ? Notre équipe est à votre écoute.</EmailSupportNote></EmailLayout>;

export default UpgradeSubscription;
