import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./EmailLayout";

/**
 * Le lien mène à la page propriétaire, qui demandera un code avant de montrer
 * quoi que ce soit. Le courriel lui-même ne porte aucun contenu clinique.
 */
export function FollowUpQuestionnaireEmail({
  patientName,
  url,
}: {
  patientName: string;
  url: string;
}) {
  return (
    <EmailLayout preview="Comment va votre animal depuis la séance ?">
      <Section>
        <Text>Bonjour,</Text>
        <Text>
          Quelques jours ont passé depuis la séance de {patientName}. Votre
          ostéopathe aimerait savoir comment il va.
        </Text>
        <Text>Trois questions, moins d'une minute.</Text>
        <Button href={url}>Répondre</Button>
      </Section>
    </EmailLayout>
  );
}

export default FollowUpQuestionnaireEmail;
