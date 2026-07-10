import React from "react";
import { EmailLayout } from "./EmailLayout";
import {
  Heading,
  Text,
  Section,
  Container,
  Button,
  Hr,
} from "@react-email/components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReportReminderEmailProps {
  clientName: string;
  organizationName: string;
  reportTitle: string;
  patientName: string;
  reminderDate: Date;
  reminderMessage?: string;
  reportUrl: string;
}

export const ReportReminderEmail: React.FC<ReportReminderEmailProps> = ({
  clientName,
  organizationName,
  reportTitle,
  patientName,
  reminderDate,
  reminderMessage,
  reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports`,
}) => {
  const formattedDate = format(reminderDate, "d MMMM yyyy 'à' HH:mm", {
    locale: fr,
  });

  return (
    <EmailLayout preview={`Rappel : ${reportTitle} - Reprendre rendez-vous`}>
      <Container className="text-center mb-6">
        <Text className="text-5xl mb-4">📅</Text>
        <Heading className="text-2xl font-bold text-gray-800 mb-4">
          Rappel : Reprendre rendez-vous
        </Heading>
      </Container>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-2">
          Bonjour {clientName},
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          Nous vous rappelons qu&apos;il est temps de reprendre rendez-vous pour{" "}
          <strong>{patientName}</strong> suite au rapport{" "}
          <strong>{reportTitle}</strong> réalisé par {organizationName}.
        </Text>
        {reminderMessage && (
          <Text className="text-base text-gray-700 mb-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <strong>Message de {organizationName} :</strong> {reminderMessage}
          </Text>
        )}
      </Section>

      <Section className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-6">
        <Heading className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-3 text-center">
          📅 Date du rappel
        </Heading>
        <Container className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-2 text-center">
            <strong>{formattedDate}</strong>
          </Text>
        </Container>
      </Section>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-4">
          Vous pouvez consulter le rapport en cliquant sur le bouton
          ci-dessous, puis prendre rendez-vous avec {organizationName}.
        </Text>
        <Container className="text-center">
          <Button
            href={reportUrl}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-medium no-underline inline-block"
          >
            Voir le rapport
          </Button>
        </Container>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section className="mb-6">
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Ce rappel a été programmé par {organizationName}. Si vous avez des
          questions, n&apos;hésitez pas à les contacter directement.
        </Text>
      </Section>
    </EmailLayout>
  );
};

