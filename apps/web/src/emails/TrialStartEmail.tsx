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

interface TrialStartEmailProps {
  organizationName: string;
  trialEndDate: Date;
  contactEmail: string;
}

export const TrialStartEmail: React.FC<TrialStartEmailProps> = ({
  organizationName,
  trialEndDate = new Date(),
  contactEmail,
}) => {
  const formattedDate = format(trialEndDate, "d MMMM yyyy", { locale: fr });

  return (
    <EmailLayout
      preview={`Bienvenue dans votre période d'essai gratuite Biume !`}
    >
      <Container className="text-center mb-6">
        <Text className="text-5xl mb-4">🎉</Text>
        <Heading className="text-3xl font-bold text-gray-800 mb-4">
          Merci pour votre confiance !
        </Heading>
      </Container>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-4">
          Bonjour {organizationName},
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          Nous vous remercions sincèrement d&apos;avoir choisi Biume pour
          accompagner votre activité de thérapeute animalier. Votre confiance
          nous honore et nous motive à vous offrir la meilleure expérience
          possible.
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          <strong>
            Votre période d&apos;essai gratuite de 15 jours a officiellement
            commencé !
          </strong>{" "}
          Vous avez maintenant accès à toutes les fonctionnalités premium de
          Biume jusqu&apos;au <strong>{formattedDate}</strong>.
        </Text>
      </Section>

      <Section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200 mb-6">
        <Heading className="text-xl font-bold text-indigo-900 mb-4 text-center">
          💳 Information importante sur le paiement
        </Heading>
        <Container className="bg-white p-5 rounded-lg border border-indigo-100 mb-4">
          <Text className="text-base text-gray-700 mb-3">
            <strong>Carte bancaire enregistrée :</strong> Pour activer votre
            période d&apos;essai, nous vous avons demandé d&apos;enregistrer
            votre carte bancaire.
          </Text>
          <Text className="text-base text-indigo-800 font-medium mb-3">
            ✅ <strong>Aucun débit pendant la période d&apos;essai</strong>
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            • Votre carte ne sera <strong>pas débitée</strong> pendant toute la
            durée de votre essai
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            • Le premier prélèvement aura lieu uniquement le{" "}
            <strong>{formattedDate}</strong>
          </Text>
          <Text className="text-sm text-gray-600">
            • Vous recevrez des rappels avant la fin de votre période
            d&apos;essai
          </Text>
        </Container>

        <Container className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <Text className="text-sm text-amber-800 font-medium mb-2">
            🔔 Vous n&apos;êtes pas convaincu ?
          </Text>
          <Text className="text-sm text-amber-700">
            Pas de souci ! Vous pouvez annuler à tout moment avant le{" "}
            {formattedDate} et vous ne serez jamais débité. Nous vous enverrons
            plusieurs rappels pour que vous ne l&apos;oubliez pas.
          </Text>
        </Container>
      </Section>

      <Section className="mb-6">
        <Heading className="text-xl font-bold text-gray-800 mb-4 text-center">
          🚀 Profitez au maximum de votre essai
        </Heading>
        <Text className="text-base text-gray-700 mb-4">
          Voici ce que vous pouvez faire dès maintenant :
        </Text>

        <Container className="space-y-3">
          <Container className="flex items-start p-4 bg-gray-50 rounded-lg">
            <Text className="text-2xl mr-3">📅</Text>
            <Container>
              <Text className="font-semibold text-gray-800 mb-1">
                Configurez votre agenda
              </Text>
              <Text className="text-sm text-gray-600">
                Paramétrez vos horaires et créez vos premiers créneaux de
                disponibilité
              </Text>
            </Container>
          </Container>

          <Container className="flex items-start p-4 bg-gray-50 rounded-lg">
            <Text className="text-2xl mr-3">👥</Text>
            <Container>
              <Text className="font-semibold text-gray-800 mb-1">
                Ajoutez vos clients
              </Text>
              <Text className="text-sm text-gray-600">
                Importez ou créez vos fiches clients et leurs animaux
              </Text>
            </Container>
          </Container>

          <Container className="flex items-start p-4 bg-gray-50 rounded-lg">
            <Text className="text-2xl mr-3">💳</Text>
            <Container>
              <Text className="font-semibold text-gray-800 mb-1">
                Activez les paiements en ligne
              </Text>
              <Text className="text-sm text-gray-600">
                Permettez à vos clients de réserver et payer directement en
                ligne
              </Text>
            </Container>
          </Container>

          <Container className="flex items-start p-4 bg-gray-50 rounded-lg">
            <Text className="text-2xl mr-3">📊</Text>
            <Container>
              <Text className="font-semibold text-gray-800 mb-1">
                Explorez les fonctionnalités
              </Text>
              <Text className="text-sm text-gray-600">
                Comptes rendus, observations, gestion comptable... Tout est
                inclus !
              </Text>
            </Container>
          </Container>
        </Container>
      </Section>

      <Section className="text-center mb-6">
        <Button
          className="bg-indigo-600 text-white font-medium px-8 py-4 rounded-lg no-underline inline-block hover:bg-indigo-700"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        >
          Accéder à mon tableau de bord
        </Button>
      </Section>

      <Hr className="border-t border-gray-200 my-6" />

      <Section>
        <Text className="text-sm text-gray-600 mb-4 text-center">
          Besoin d&apos;aide pour démarrer ? Notre équipe est là pour vous
          accompagner.
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Contactez-nous à <strong>{contactEmail}</strong>
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default TrialStartEmail;
