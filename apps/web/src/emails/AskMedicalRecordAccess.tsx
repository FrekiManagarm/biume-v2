import { EmailLayout } from "./EmailLayout"
import { Button, Heading, Section, Text } from "@react-email/components"

interface AskMedicalRecordAccessProps {
  ownerName: string
  animalName: string
  accessLink: string
  proName: string
  justification: string
}

const AskMedicalRecordAccess = ({
  ownerName,
  animalName,
  accessLink,
  proName,
  justification,
}: AskMedicalRecordAccessProps) => {
  return (
    <EmailLayout preview={`Demande d'accès au dossier médical de ${animalName}`}>
      <Section className="text-center mb-8">
        <Heading className="text-2xl font-bold text-indigo-600 mb-2">Demande d'accès au dossier médical</Heading>
      </Section>

      <Section className="bg-indigo-50 rounded-lg p-6 mb-8">
        <Heading className="text-xl font-semibold text-gray-900 mb-4">Bonjour {ownerName},</Heading>
        <Text className="text-gray-700 mb-4 leading-relaxed">
          {proName} a besoin de votre autorisation pour accéder au dossier médical complet de{" "}
          <span className="font-semibold text-indigo-600">{animalName}</span>.
        </Text>
        <Text className="text-gray-700 leading-relaxed">
          Cette autorisation nous permettra de mieux prendre soin de votre animal et d'assurer un suivi médical optimal.
        </Text>
      </Section>

      <Section className="bg-gray-50 rounded-lg p-4 mb-6">
        <Heading className="text-lg font-semibold text-gray-900 mb-2">Motif de la demande :</Heading>
        <Text className="text-gray-700 leading-relaxed italic">"{justification}"</Text>
      </Section>

      <Section className="text-center my-8">
        <Button
          href={accessLink}
          className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
        >
          Autoriser l'accès au dossier
        </Button>
      </Section>

      <Section className="border-t border-gray-200 pt-6 mt-8">
        <Text className="text-gray-600 text-sm text-center">
          Si vous ne souhaitez pas autoriser l'accès, vous pouvez simplement ignorer cet email.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default AskMedicalRecordAccess
