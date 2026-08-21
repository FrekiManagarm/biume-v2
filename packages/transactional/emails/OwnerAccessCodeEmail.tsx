import { Section, Text } from "@react-email/components";

import { EmailLayout } from "./EmailLayout";

/**
 * Ne contient que le code et sa durée de validité. Ni nom d'animal, ni contenu
 * de compte rendu, ni lien menant directement au rapport : une boîte mail
 * compromise ne doit pas suffire à ouvrir un dossier de santé.
 */
export function OwnerAccessCodeEmail({ code }: { code: string }) {
  return (
    <EmailLayout preview="Votre code d'accès Biume" tone="security">
      <Section>
        <Text>Bonjour,</Text>
        <Text>
          Voici le code à saisir pour consulter le compte rendu de votre animal.
        </Text>
        <Text style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "6px" }}>
          {code}
        </Text>
        <Text>
          Il est valable dix minutes. Si vous n'avez rien demandé, ignorez ce
          message.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default OwnerAccessCodeEmail;
