import { Text } from "@react-email/components";
import { EmailAction, EmailInfoCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

export const WelcomeBiume = () => <EmailLayout preview="Bienvenue sur Biume"><EmailTitle eyebrow="Bienvenue">Bienvenue dans Biume.</EmailTitle><Text style={bodyText}>Nous sommes ravis de vous accompagner dans la gestion de votre activité et le suivi de vos patients.</Text><EmailInfoCard title="VOTRE ESPACE">Centralisez vos rendez-vous, clients, animaux, paiements et rapports professionnels au même endroit.</EmailInfoCard><EmailAction href="https://biume.com/dashboard">Découvrir mon espace</EmailAction><EmailSupportNote email="support@biume.com">Une question ? Notre équipe est là pour vous aider.</EmailSupportNote></EmailLayout>;
