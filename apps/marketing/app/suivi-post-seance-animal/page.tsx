import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Suivi post-séance animal",
  description:
    "Structurez le suivi post-séance animal: résumé propriétaire, évolution, points à surveiller, retour J+7 et prochaine étape.",
  path: "/suivi-post-seance-animal",
});

export default function FollowUpPage() {
  return (
    <SeoPage
      path="/suivi-post-seance-animal"
      eyebrow="Suivi post-séance animal"
      title={
        <>
          Un suivi post-séance animal qui rend{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            l&apos;évolution visible
          </span>
        </>
      }
      description="Le suivi post-séance animal aide le propriétaire à comprendre ce qui a été observé, quoi surveiller et quand revenir vers le praticien. Biume structure cette continuité après chaque rendez-vous."
      stats={[
        { value: "J+7", label: "retour simple" },
        { value: "J+30", label: "prochaine étape" },
        { value: "1", label: "timeline animal" },
      ]}
      panel={{
        eyebrow: "Continuité",
        title: "La relation se joue aussi après la séance.",
        body: "Le propriétaire quitte souvent le rendez-vous avec beaucoup d'informations. Biume transforme ces informations en suivi clair, mémorisable et réutilisable.",
        items: [
          "Résumé de séance court et propriétaire-friendly.",
          "Points à surveiller: confort, mobilité, comportement.",
          "Retour propriétaire intégré à la timeline animal.",
        ],
      }}
      sections={[
        {
          eyebrow: "Pourquoi",
          title: "Le suivi post-séance augmente la valeur perçue de votre travail.",
          body: "Votre expertise est visible pendant la séance, mais le propriétaire doit pouvoir s'en souvenir après. Un suivi clair renforce la confiance et donne une raison professionnelle de garder le contact.",
        },
        {
          eyebrow: "J+7",
          title: "Un retour rapide pour comprendre l'évolution.",
          body: "Le suivi J+7 peut demander comment l'animal bouge, s'il semble plus confortable ou si certains points restent à surveiller. La réponse enrichit votre mémoire de suivi.",
        },
        {
          eyebrow: "J+30",
          title: "Une prochaine étape lorsque vous l'avez prévue.",
          body: "La relance J+30 ne sert pas à pousser une vente automatique. Elle rappelle la prochaine étape pertinente si vous l'avez recommandée et si le suivi de l'animal le justifie.",
        },
        {
          eyebrow: "Biume",
          title: "Un système simple pour ne plus oublier.",
          body: "Biume relie résumé propriétaire, timeline animal et relances. Vous gardez la décision, l'outil garde le fil.",
        },
      ]}
      faq={[
        {
          question: "Que doit contenir un suivi post-séance animal ?",
          answer:
            "Un résumé clair, les points observés, les éléments à surveiller, les conseils transmis par le praticien et une prochaine étape si elle est pertinente.",
        },
        {
          question: "Le suivi post-séance remplace-t-il une consultation vétérinaire ?",
          answer:
            "Non. Il sert à la communication et à la continuité du suivi du praticien manuel. Il ne remplace pas un avis vétérinaire.",
        },
        {
          question: "Comment Biume aide-t-il à fidéliser ?",
          answer:
            "En rendant le suivi plus professionnel et plus régulier. Le propriétaire comprend mieux l'évolution et sait quand reprendre contact.",
        },
      ]}
      internalLinks={[
        { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
      ]}
      schemaType="Article"
    />
  );
}
