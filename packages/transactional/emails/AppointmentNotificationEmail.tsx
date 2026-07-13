import { Text } from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { EmailDetailRows, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface AppointmentNotificationEmailProps { clientName: string; petName: string; appointmentDate: Date; appointmentTime: string; duration: number; atHome: boolean; note?: string; organizationName?: string; }

const AppointmentNotificationEmail = ({ clientName = "Cher client", petName = "votre animal", appointmentDate = new Date(), appointmentTime = "10:00", duration = 30, atHome = false, note, organizationName = "votre vétérinaire" }: AppointmentNotificationEmailProps) => {
  const durationText = duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60} min` : ""}` : `${duration} minutes`;
  return <EmailLayout preview={`Nouveau rendez-vous pour ${petName}`}><EmailTitle eyebrow="Rendez-vous">Votre rendez-vous est confirmé.</EmailTitle><Text style={bodyText}>Bonjour {clientName}, un rendez-vous a été programmé pour {petName}.</Text><EmailDetailRows rows={[{ label: "Date", value: format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr }) }, { label: "Heure", value: appointmentTime }, { label: "Durée", value: durationText }, ...(atHome ? [{ label: "Lieu", value: "À domicile" }] : []), ...(note ? [{ label: "Note", value: note }] : [])]} /><EmailSupportNote>Pour modifier ce rendez-vous ou poser une question, contactez {organizationName}.</EmailSupportNote></EmailLayout>;
};

export default AppointmentNotificationEmail;
