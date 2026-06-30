import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Relance client ostéopathe animalier",
  description:
    "Créez une relance client pour ostéopathe animalier: message J+7, retour propriétaire, suivi d'évolution et prochaine étape.",
  path: "/relance-client-osteopathe-animalier",
});

export default function ReminderPage() {
  return (
    <SeoPage
      path="/relance-client-osteopathe-animalier"
      eyebrow="Relance client"
      title={
        <>
          Relancer vos clients sans perdre votre{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            posture professionnelle
          </span>
        </>
      }
      description="La relance client ostéopathe animalier doit rester utile: demander un retour, rappeler les points à surveiller et proposer une prochaine étape si elle a été prévue par le praticien."
      stats={[
        { value: "J+7", label: "retour propriétaire" },
        { value: "J+30", label: "rappel possible" },
        { value: "1", label: "suivi clair" },
      ]}
      panel={{
        eyebrow: "Levier",
        title: "Une relance utile vaut mieux qu'un rappel commercial.",
        body: "Les praticiens manuels de santé animale gagnent à relancer avec tact: pour suivre l'évolution, pas pour forcer un rendez-vous.",
        items: [
          "Demander comment l'animal évolue depuis la séance.",
          "Rappeler les points à surveiller transmis au propriétaire.",
          "Proposer la prochaine étape seulement si elle est pertinente.",
        ],
      }}
      sections={[
        {
          eyebrow: "Message J+7",
          title: "Demander un retour court et facile.",
          body: "Une relance J+7 peut demander si le propriétaire observe plus de confort, une mobilité différente ou une gêne persistante. L'objectif est d'obtenir une réponse simple, pas un long formulaire.",
        },
        {
          eyebrow: "Message J+30",
          title: "Préparer la prochaine étape sans automatisme agressif.",
          body: "Si vous avez conseillé une vérification ou une nouvelle séance, Biume peut vous aider à préparer le rappel. Le praticien garde le contrôle du moment et du contenu.",
        },
        {
          eyebrow: "Mémoire",
          title: "Chaque réponse enrichit la timeline animal.",
          body: "Les retours propriétaires deviennent utiles pour la séance suivante. Vous retrouvez plus vite l'historique, les observations et l'évolution entre deux rendez-vous.",
        },
        {
          eyebrow: "Biume",
          title: "Un levier de fidélisation naturel.",
          body: "Biume vous aide à transformer la relance client en suivi professionnel: plus clair, plus régulier et plus aligné avec la relation de soin.",
        },
      ]}
      faq={[
        {
          question: "Quand relancer un client après une séance ?",
          answer:
            "Souvent autour de J+7 pour demander un retour simple, puis plus tard si une prochaine étape avait été prévue. Le bon moment dépend toujours du praticien.",
        },
        {
          question: "Comment éviter une relance trop commerciale ?",
          answer:
            "Centrez le message sur l'évolution de l'animal, les points à surveiller et la clarté du suivi. Le rendez-vous vient ensuite si c'est pertinent.",
        },
        {
          question: "Biume envoie-t-il les relances automatiquement ?",
          answer:
            "Biume aide à préparer et structurer les relances. Le praticien garde la main sur ce qui est envoyé.",
        },
      ]}
      internalLinks={[
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
        { href: "/tarifs", label: "Tarifs" },
      ]}
      schemaType="Article"
    />
  );
}
