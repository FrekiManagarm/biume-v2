import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EmailDetailRows, EmailSuccessCard, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface SubscriptionReceiptEmailProps { customerName: string; planName: string; amount: number; currency: string; transactionId: string; date: Date; nextBillingDate: Date; }

const SubscriptionReceiptEmail = ({ customerName, planName, amount, currency, transactionId, date, nextBillingDate }: SubscriptionReceiptEmailProps) => <EmailLayout preview="Votre reçu Biume"><EmailTitle eyebrow="Facturation">Votre paiement a été reçu.</EmailTitle><Text style={bodyText}>Bonjour {customerName}, merci pour votre abonnement Biume.</Text><EmailSuccessCard title="PAIEMENT CONFIRMÉ">Votre règlement a bien été enregistré.</EmailSuccessCard><EmailDetailRows rows={[{ label: "Offre", value: planName }, { label: "Montant", value: new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount) }, { label: "Date", value: format(date, "d MMMM yyyy", { locale: fr }) }, { label: "Référence", value: transactionId }, { label: "Prochain prélèvement", value: format(nextBillingDate, "d MMMM yyyy", { locale: fr }) }]} /><EmailSupportNote>Conservez ce reçu pour vos archives.</EmailSupportNote></EmailLayout>;

export default SubscriptionReceiptEmail;
