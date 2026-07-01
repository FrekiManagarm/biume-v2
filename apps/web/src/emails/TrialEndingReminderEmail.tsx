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

interface TrialEndingReminderEmailProps {
  organizationName: string;
  trialEndDate: Date;
  daysRemaining: number;
  contactEmail: string;
  upgradeUrl: string;
  cancelUrl: string;
}

export const TrialEndingReminderEmail: React.FC<
  TrialEndingReminderEmailProps
> = ({
  organizationName,
  trialEndDate = new Date(),
  daysRemaining,
  contactEmail = "support@biume.com",
  upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
}) => {
  const formattedDate = format(trialEndDate, "d MMMM yyyy", { locale: fr });
  const isUrgent = daysRemaining <= 3;

  return (
    <EmailLayout
      preview={`Votre période d'essai Biume se termine ${daysRemaining === 1 ? "demain" : `dans ${daysRemaining} jours`} !`}
    >
      <Container className="text-center mb-6">
        <Text className="text-5xl mb-4">{isUrgent ? "⚠️" : "⏰"}</Text>
        <Heading className="text-2xl font-bold text-gray-800 mb-4">
          Votre période d&apos;essai se termine{" "}
          {daysRemaining === 1 ? "demain" : `dans ${daysRemaining} jours`}
        </Heading>
      </Container>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-2">
          Bonjour {organizationName},
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          Nous vous informons que votre période d&apos;essai gratuite de Biume
          se termine{" "}
          {daysRemaining === 1 ? "demain" : `dans ${daysRemaining} jours`}, le{" "}
          <strong>{formattedDate}</strong>.
        </Text>
      </Section>

      <Section className="bg-linear-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-300 mb-6">
        <Heading className="text-lg font-bold text-amber-900 mb-3 text-center">
          💳 Action requise - Information importante
        </Heading>

        <Container className="bg-white p-5 rounded-lg border border-amber-200 mb-4">
          <Text className="text-base font-semibold text-amber-900 mb-3">
            Que se passe-t-il le {formattedDate} ?
          </Text>

          <Container className="space-y-2 mb-4">
            <Container className="flex items-start">
              <Text className="text-amber-600 mr-2">•</Text>
              <Text className="text-sm text-gray-700">
                Si vous continuez avec Biume, votre carte bancaire sera{" "}
                <strong>automatiquement débitée</strong> pour le premier mois
                d&apos;abonnement
              </Text>
            </Container>

            <Container className="flex items-start">
              <Text className="text-amber-600 mr-2">•</Text>
              <Text className="text-sm text-gray-700">
                Vous conserverez l&apos;accès à toutes les fonctionnalités
                premium
              </Text>
            </Container>

            <Container className="flex items-start">
              <Text className="text-amber-600 mr-2">•</Text>
              <Text className="text-sm text-gray-700">
                Vous pourrez annuler votre abonnement à tout moment par la suite
              </Text>
            </Container>
          </Container>

          <Hr className="border-t border-amber-100 my-4" />

          <Container className="bg-red-50 p-4 rounded-lg border border-red-200">
            <Text className="text-base font-semibold text-red-900 mb-2">
              🚫 Vous n&apos;êtes pas convaincu ?
            </Text>
            <Text className="text-sm text-red-800 mb-3">
              <strong>Aucun problème !</strong> Pour éviter tout débit, annulez
              simplement votre abonnement avant le{" "}
              <strong>{formattedDate}</strong>.
            </Text>
            <Text className="text-xs text-red-700">
              L&apos;annulation est simple, rapide et sans frais. Cliquez sur le
              bouton ci-dessous pour gérer votre abonnement.
            </Text>
          </Container>
        </Container>
      </Section>

      <Section className="mb-6">
        <Heading className="text-lg font-bold text-gray-800 mb-3 text-center">
          ✨ Pourquoi continuer avec Biume ?
        </Heading>

        <Container className="grid gap-3 mb-4">
          <Container className="flex items-start p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <Text className="text-2xl mr-3">⚡</Text>
            <Container>
              <Text className="font-semibold text-indigo-900 mb-1">
                Gain de temps quotidien
              </Text>
              <Text className="text-sm text-gray-700">
                Automatisez vos tâches administratives et concentrez-vous sur
                vos patients
              </Text>
            </Container>
          </Container>

          <Container className="flex items-start p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <Text className="text-2xl mr-3">📈</Text>
            <Container>
              <Text className="font-semibold text-indigo-900 mb-1">
                Développez votre activité
              </Text>
              <Text className="text-sm text-gray-700">
                Réservations en ligne, paiements automatiques, gestion client
                simplifiée
              </Text>
            </Container>
          </Container>

          <Container className="flex items-start p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <Text className="text-2xl mr-3">💪</Text>
            <Container>
              <Text className="font-semibold text-indigo-900 mb-1">
                Support dédié
              </Text>
              <Text className="text-sm text-gray-700">
                Une équipe à votre écoute pour vous accompagner au quotidien
              </Text>
            </Container>
          </Container>
        </Container>
      </Section>

      <Section className="text-center mb-6">
        <Text className="text-sm text-gray-600 mb-4">
          Choisissez votre action :
        </Text>

        <Button
          className="bg-indigo-600 text-white font-medium px-8 py-4 rounded-lg no-underline inline-block hover:bg-indigo-700 mb-3"
          href={upgradeUrl}
        >
          Continuer avec Biume
        </Button>
        <br />
        <Button
          className="bg-white text-gray-700 font-medium px-6 py-3 rounded-lg no-underline inline-block border border-gray-300 hover:bg-gray-50"
          href={cancelUrl}
        >
          Annuler mon abonnement
        </Button>
      </Section>

      <Hr className="border-t border-gray-200 my-6" />

      <Section>
        <Text className="text-sm text-gray-600 mb-4 text-center">
          Des questions sur votre abonnement ou besoin d&apos;aide ?
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Notre équipe est disponible à <strong>{contactEmail}</strong>
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default TrialEndingReminderEmail;
