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

interface TrialFollowUpEmailProps {
  organizationName: string;
  trialEndDate: Date;
  daysRemaining: number;
  contactEmail: string;
}

export const TrialFollowUpEmail: React.FC<TrialFollowUpEmailProps> = ({
  organizationName,
  trialEndDate = new Date(),
  daysRemaining,
  contactEmail,
}) => {
  const formattedDate = format(trialEndDate, "d MMMM yyyy", { locale: fr });

  return (
    <EmailLayout
      preview={`Comment se passe votre expérience Biume ? ${daysRemaining} jours restants`}
    >
      <Container className="text-center mb-6">
        <Text className="text-5xl mb-4">👋</Text>
        <Heading className="text-2xl font-bold text-gray-800 mb-4">
          Comment se passe votre expérience Biume ?
        </Heading>
      </Container>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-2">
          Bonjour {organizationName},
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          Cela fait maintenant 5 jours que vous utilisez Biume et nous espérons
          que vous profitez pleinement de toutes nos fonctionnalités ! Il vous
          reste encore <strong>{daysRemaining} jours</strong> pour explorer la
          plateforme avant la fin de votre période d&apos;essai gratuite le{" "}
          <strong>{formattedDate}</strong>.
        </Text>
      </Section>

      <Section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
        <Heading className="text-xl font-bold text-indigo-900 mb-4 text-center">
          💡 Trucs et astuces pour bien utiliser Biume
        </Heading>

        <Container className="space-y-4">
          <Container className="bg-white p-5 rounded-lg border border-indigo-100">
            <Container className="flex items-start">
              <Text className="text-2xl mr-3">🎯</Text>
              <Container>
                <Text className="font-semibold text-indigo-900 mb-2">
                  Personnalisez vos comptes rendus
                </Text>
                <Text className="text-sm text-gray-700">
                  Créez des templates de rapports réutilisables pour gagner du
                  temps. Ajoutez votre signature et votre logo pour un rendu
                  professionnel.
                </Text>
              </Container>
            </Container>
          </Container>

          <Container className="bg-white p-5 rounded-lg border border-indigo-100">
            <Container className="flex items-start">
              <Text className="text-2xl mr-3">📅</Text>
              <Container>
                <Text className="font-semibold text-indigo-900 mb-2">
                  Optimisez votre agenda
                </Text>
                <Text className="text-sm text-gray-700">
                  Configurez vos horaires de disponibilité et vos temps de
                  pause. Vos clients pourront ainsi réserver directement en
                  ligne aux créneaux qui vous conviennent.
                </Text>
              </Container>
            </Container>
          </Container>

          <Container className="bg-white p-5 rounded-lg border border-indigo-100">
            <Container className="flex items-start">
              <Text className="text-2xl mr-3">🔔</Text>
              <Container>
                <Text className="font-semibold text-indigo-900 mb-2">
                  Activez les notifications automatiques
                </Text>
                <Text className="text-sm text-gray-700">
                  Réduisez les absences en envoyant des rappels automatiques à
                  vos clients avant leurs rendez-vous. Personnalisez le délai et
                  le message.
                </Text>
              </Container>
            </Container>
          </Container>

          <Container className="bg-white p-5 rounded-lg border border-indigo-100">
            <Container className="flex items-start">
              <Text className="text-2xl mr-3">💳</Text>
              <Container>
                <Text className="font-semibold text-indigo-900 mb-2">
                  Facilitez les paiements en ligne
                </Text>
                <Text className="text-sm text-gray-700">
                  Connectez votre compte Stripe pour permettre à vos clients de
                  payer directement lors de la réservation. Fini les impayés et
                  les relances !
                </Text>
              </Container>
            </Container>
          </Container>

          <Container className="bg-white p-5 rounded-lg border border-indigo-100">
            <Container className="flex items-start">
              <Text className="text-2xl mr-3">📊</Text>
              <Container>
                <Text className="font-semibold text-indigo-900 mb-2">
                  Suivez vos statistiques
                </Text>
                <Text className="text-sm text-gray-700">
                  Consultez votre tableau de bord pour visualiser
                  l&apos;évolution de votre activité : revenus, nombre de
                  consultations, clients récurrents...
                </Text>
              </Container>
            </Container>
          </Container>
        </Container>
      </Section>

      <Section className="bg-amber-50 p-5 rounded-lg border border-amber-200 mb-6">
        <Text className="text-base font-medium text-amber-900 mb-2 text-center">
          💬 Besoin d&apos;aide ?
        </Text>
        <Text className="text-sm text-amber-800 text-center">
          Notre équipe est là pour vous accompagner. N&apos;hésitez pas à nous
          contacter si vous avez la moindre question ou si vous souhaitez être
          guidé dans la prise en main de certaines fonctionnalités.
        </Text>
      </Section>

      <Section className="text-center mb-6">
        <Button
          className="bg-indigo-600 text-white font-medium px-8 py-4 rounded-lg no-underline inline-block hover:bg-indigo-700"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        >
          Continuer à explorer Biume
        </Button>
      </Section>

      <Hr className="border-t border-gray-200 my-6" />

      <Section>
        <Text className="text-sm text-gray-600 mb-2 text-center">
          Une question ? Un besoin spécifique ? Nous sommes à votre écoute.
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Contactez-nous à <strong>{contactEmail}</strong>
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default TrialFollowUpEmail;
