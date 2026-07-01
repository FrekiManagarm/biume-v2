import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./EmailLayout";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AppointmentNotificationEmailProps {
  clientName: string;
  petName: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  atHome: boolean;
  note?: string;
  organizationName?: string;
}

const AppointmentNotificationEmail = ({
  clientName = "Cher client",
  petName = "votre animal",
  appointmentDate = new Date(),
  appointmentTime = "10:00",
  duration = 30,
  atHome = false,
  note,
  organizationName = "votre vétérinaire",
}: AppointmentNotificationEmailProps) => {
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", {
    locale: fr,
  });
  const durationText =
    duration >= 60
      ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}min` : ""}`
      : `${duration} minutes`;

  return (
    <EmailLayout preview={`Nouveau rendez-vous pour ${petName}`}>
      <Section>
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Nouveau rendez-vous confirmé
        </Text>

        <Text className="text-gray-600 mb-4">Bonjour {clientName},</Text>

        <Text className="text-gray-600 mb-4">
          Un nouveau rendez-vous a été programmé pour {petName}.
        </Text>

        <Section className="bg-gray-50 rounded-lg p-4 my-6">
          <Text className="text-gray-800 font-semibold mb-2">
            Détails du rendez-vous :
          </Text>
          <Text className="text-gray-600 mb-1">
            <strong>Date :</strong> {formattedDate}
          </Text>
          <Text className="text-gray-600 mb-1">
            <strong>Heure :</strong> {appointmentTime}
          </Text>
          <Text className="text-gray-600 mb-1">
            <strong>Durée :</strong> {durationText}
          </Text>
          {atHome && (
            <Text className="text-gray-600 mb-1">
              <strong>Lieu :</strong> À domicile
            </Text>
          )}
          {note && (
            <Text className="text-gray-600 mt-2">
              <strong>Note :</strong> {note}
            </Text>
          )}
        </Section>

        {atHome && (
          <Text className="text-gray-600 mb-4">
            Le rendez-vous se déroulera à votre domicile. Veuillez vous assurer
            d'être présent(e) à l'heure prévue.
          </Text>
        )}

        <Text className="text-gray-600 mb-4">
          Si vous avez des questions ou souhaitez modifier ce rendez-vous,
          n'hésitez pas à nous contacter.
        </Text>

        <Text className="text-gray-600">
          Cordialement,
          <br />
          {organizationName}
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default AppointmentNotificationEmail;

