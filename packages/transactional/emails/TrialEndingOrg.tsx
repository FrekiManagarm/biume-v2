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

interface TrialEndingOrgProps {
  organizationName: string;
  trialEndDate: Date;
  daysRemaining: number;
  contactEmail: string;
  upgradeUrl: string;
}

export const TrialEndingOrg: React.FC<TrialEndingOrgProps> = ({
  organizationName,
  trialEndDate = new Date(),
  daysRemaining,
  contactEmail,
  upgradeUrl,
}) => {
  return (
    <EmailLayout
      preview={`Votre période d'essai Biume se termine dans ${daysRemaining} jours`}
    >
      <Heading className="text-2xl font-bold text-gray-800 mb-6">
        Votre période d'essai se termine bientôt
      </Heading>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-2">
          Bonjour {organizationName},
        </Text>
        <Text className="text-base text-gray-700 mb-4">
          Nous espérons que vous appréciez l&apos;expérience Biume ! Nous vous
          informons que votre période d&apos;essai se termine dans{" "}
          <strong>{daysRemaining} jours</strong>, le{" "}
          {format(trialEndDate, "d MMMM yyyy")}.
        </Text>
      </Section>

      <Section className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-6">
        <Text className="text-base font-medium text-amber-800 mb-2">
          Que se passe-t-il à la fin de votre période d'essai ?
        </Text>
        <Text className="text-sm text-amber-700 mb-1">
          • Vous n'aurez plus accès aux fonctionnalités premium de Biume
        </Text>
        <Text className="text-sm text-amber-700 mb-1">
          • Vos données resteront sauvegardées pendant 30 jours
        </Text>
        <Text className="text-sm text-amber-700">
          • Vous pouvez à tout moment passer à un abonnement payant pour
          conserver l'accès à toutes les fonctionnalités
        </Text>
      </Section>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 mb-4">
          Nous avons conçu Biume pour vous aider à gérer efficacement votre
          activité dans le secteur animalier. En passant à un abonnement payant,
          vous bénéficierez de :
        </Text>

        <Container className="mb-6">
          <div className="py-5 px-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-t-lg">
            <Text className="text-lg font-bold text-violet-400 text-center">
              Les avantages Premium
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5 border-l border-r border-b border-indigo-200 rounded-b-lg bg-white">
            <div className="flex items-center p-4 border border-indigo-100 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="mr-3 bg-indigo-100 p-2 rounded-full flex items-center justify-center"
                style={{ minWidth: "40px", height: "40px" }}
              >
                <Text className="text-xl" style={{ lineHeight: 1 }}>
                  📅
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-indigo-900 mb-1">
                  Gestion illimitée
                </Text>
                <Text className="text-xs text-gray-600">
                  Clients et rendez-vous sans restriction
                </Text>
              </div>
            </div>

            <div className="flex items-center p-4 border border-indigo-100 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="mr-3 bg-indigo-100 p-2 rounded-full flex items-center justify-center"
                style={{ minWidth: "40px", height: "40px" }}
              >
                <Text className="text-xl" style={{ lineHeight: 1 }}>
                  📊
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-indigo-900 mb-1">
                  Outils d'analyse
                </Text>
                <Text className="text-xs text-gray-600">
                  Suivi et rapports avancés
                </Text>
              </div>
            </div>

            <div className="flex items-center p-4 border border-indigo-100 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="mr-3 bg-indigo-100 p-2 rounded-full flex items-center justify-center"
                style={{ minWidth: "40px", height: "40px" }}
              >
                <Text className="text-xl" style={{ lineHeight: 1 }}>
                  💬
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-indigo-900 mb-1">
                  Support prioritaire
                </Text>
                <Text className="text-xs text-gray-600">
                  Assistance dédiée et réactive
                </Text>
              </div>
            </div>

            <div className="flex items-center p-4 border border-indigo-100 rounded-lg hover:shadow-md transition-shadow">
              <div
                className="mr-3 bg-indigo-100 p-2 rounded-full flex items-center justify-center"
                style={{ minWidth: "40px", height: "40px" }}
              >
                <Text className="text-xl" style={{ lineHeight: 1 }}>
                  🚀
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-indigo-900 mb-1">
                  Exclusivités Premium
                </Text>
                <Text className="text-xs text-gray-600">
                  Fonctionnalités avancées de croissance
                </Text>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="text-center mb-6">
        <Button
          className="bg-violet-400 text-white font-medium px-6 py-3 rounded-md no-underline inline-block hover:bg-indigo-700"
          href={upgradeUrl}
        >
          Passer à un abonnement payant
        </Button>
      </Section>

      <Hr className="border-t border-gray-200 my-6" />

      <Section>
        <Text className="text-sm text-gray-600 mb-4">
          Si vous avez des questions ou besoin d'assistance, n'hésitez pas à
          contacter notre équipe à {contactEmail}.
        </Text>
        <Text className="text-sm text-gray-600">
          Merci de faire confiance à Biume pour la gestion de votre activité.
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default TrialEndingOrg;
