import React from "react"
import { EmailLayout } from "./EmailLayout"
import { Heading, Text, Section, Container, Button, Hr } from "@react-email/components"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TrialReminderEmailProps {
  organizationName: string
  trialEndDate: Date
  daysRemaining: number
  contactEmail: string
  upgradeUrl: string
}

export const TrialReminderEmail: React.FC<TrialReminderEmailProps> = ({
  organizationName,
  trialEndDate = new Date(),
  daysRemaining,
  contactEmail = "support@biume.com",
  upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
}) => {
  const formattedDate = format(trialEndDate, "d MMMM yyyy", { locale: fr })

  return (
    <EmailLayout preview={`Votre période d'essai Biume continue - ${daysRemaining} jours restants`}>
      <Container className="text-center mb-6">
        <Text className="text-5xl mb-4">⏰</Text>
        <Heading className="text-2xl font-bold text-gray-800 mb-4">
          Comment se passe votre expérience Biume ?
        </Heading>
      </Container>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-2">Bonjour {organizationName},</Text>
        <Text className="text-base text-gray-700 mb-4">
          Nous espérons que vous profitez pleinement de Biume ! Il vous reste encore{" "}
          <strong>{daysRemaining} jours</strong> pour explorer toutes nos fonctionnalités avant la fin de votre
          période d&apos;essai gratuite le <strong>{formattedDate}</strong>.
        </Text>
      </Section>

      <Section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
        <Heading className="text-lg font-bold text-indigo-900 mb-3 text-center">
          💳 Rappel important
        </Heading>
        <Container className="bg-white p-4 rounded-lg mb-3">
          <Text className="text-base text-gray-700 mb-2">
            <strong>Aucun débit n&apos;a encore été effectué</strong>
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            Votre carte bancaire ne sera débitée que le <strong>{formattedDate}</strong> si vous continuez à utiliser
            Biume après votre période d&apos;essai.
          </Text>
          <Text className="text-sm text-indigo-700 font-medium">
            Pour annuler, rendez-vous dans vos paramètres de facturation avant cette date.
          </Text>
        </Container>
      </Section>

      <Section className="mb-6">
        <Heading className="text-lg font-bold text-gray-800 mb-3 text-center">
          ✨ Avez-vous essayé ces fonctionnalités ?
        </Heading>

        <Container className="space-y-2">
          <Container className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Text className="text-xl mr-3">📊</Text>
            <Text className="text-sm text-gray-700">
              <strong>Comptabilité automatisée</strong> - Suivez vos revenus en temps réel
            </Text>
          </Container>

          <Container className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Text className="text-xl mr-3">📝</Text>
            <Text className="text-sm text-gray-700">
              <strong>Comptes rendus</strong> - Créez des rapports professionnels en quelques clics
            </Text>
          </Container>

          <Container className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Text className="text-xl mr-3">🔔</Text>
            <Text className="text-sm text-gray-700">
              <strong>Notifications automatiques</strong> - Rappels pour vous et vos clients
            </Text>
          </Container>

          <Container className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Text className="text-xl mr-3">💳</Text>
            <Text className="text-sm text-gray-700">
              <strong>Paiements en ligne</strong> - Encaissez directement depuis la plateforme
            </Text>
          </Container>
        </Container>
      </Section>

      <Section className="text-center mb-6">
        <Button
          className="bg-indigo-600 text-white font-medium px-8 py-4 rounded-lg no-underline inline-block hover:bg-indigo-700 mb-3"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        >
          Continuer à explorer Biume
        </Button>
        <br />
        <Button
          className="bg-white text-gray-700 font-medium px-6 py-3 rounded-lg no-underline inline-block border border-gray-300 hover:bg-gray-50"
          href={upgradeUrl}
        >
          Gérer mon abonnement
        </Button>
      </Section>

      <Hr className="border-t border-gray-200 my-6" />

      <Section>
        <Text className="text-sm text-gray-600 mb-2 text-center">
          Des questions ou besoin d&apos;aide ? Notre équipe est à votre écoute.
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Contactez-nous à <strong>{contactEmail}</strong>
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default TrialReminderEmail









