import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Exemple compte rendu ostéopathie animale",
  description:
    "Consultez un exemple de compte rendu d'ostéopathie animale clair: points observés, résumé propriétaire, conseils et relance de suivi.",
  path: "/exemple-compte-rendu-osteopathie-animale",
});

export default function ExampleReportPage() {
  return (
    <SeoPage
      path="/exemple-compte-rendu-osteopathie-animale"
      eyebrow="Exemple de compte rendu"
      title={
        <>
          Exemple de compte rendu d&apos;{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            ostéopathie animale
          </span>
        </>
      }
      description="Cet exemple de compte rendu ostéopathie animale montre comment passer de notes de séance à un résumé propriétaire clair, avec points observés, conseils transmis et suivi post-séance."
      stats={[
        { value: "3", label: "points observés" },
        { value: "48 h", label: "à surveiller" },
        { value: "PDF", label: "partageable" },
      ]}
      panel={{
        eyebrow: "Exemple",
        title: "Ce que le propriétaire doit pouvoir retenir.",
        body: "Un exemple utile ne se contente pas d'imiter un rapport. Il montre comment rendre la séance lisible et rassurante après le rendez-vous.",
        items: [
          "Résumé simple de ce qui a été observé.",
          "Conseils transmis par le praticien, sans avis médical autonome.",
          "Évolution à surveiller et moment de relance.",
        ],
      }}
      sections={[
        {
          eyebrow: "Avant",
          title: "Notes de séance: bassin droit, mobilité réduite, repos relatif.",
          body: "Les notes brutes sont utiles au praticien, mais elles restent parfois difficiles à relire pour un propriétaire. Biume aide à les transformer en phrases plus claires sans changer le fond.",
        },
        {
          eyebrow: "Après",
          title: "Résumé propriétaire: ce qui a été vu et quoi observer.",
          body: "Exemple: Naya a montré une gêne sur le bas du dos et le bassin droit. La séance vise à relancer la mobilité. Surveillez son confort dans les 48 prochaines heures et évitez les efforts intenses.",
        },
        {
          eyebrow: "Suivi",
          title: "Relance J+7: demander un retour simple.",
          body: "Une relance courte peut demander si l'animal se déplace plus librement, si le propriétaire observe une gêne ou si une prochaine étape doit être planifiée selon vos recommandations.",
        },
        {
          eyebrow: "Conversion",
          title: "L'exemple devient un levier de confiance.",
          body: "Quand le propriétaire comprend ce qui s'est passé et ce qu'il doit observer, la valeur de la séance reste visible. C'est ce que Biume aide à systématiser.",
        },
      ]}
      faq={[
        {
          question: "Un exemple de compte rendu suffit-il pour professionnaliser mon suivi ?",
          answer:
            "C'est un bon départ, mais le plus important est la régularité: compte rendu clair, timeline animal et relance de suivi quand elle est pertinente.",
        },
        {
          question: "Puis-je adapter l'exemple à un chien, un chat ou un cheval ?",
          answer:
            "Oui. La structure reste similaire, mais les points observés et conseils transmis doivent toujours être adaptés à l'animal et validés par le praticien.",
        },
        {
          question: "Biume écrit-il le rapport automatiquement ?",
          answer:
            "Biume prépare une version de travail à partir de vos observations. Vous relisez et validez avant partage.",
        },
      ]}
      internalLinks={[
        { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/tarifs", label: "Essayer Biume" },
      ]}
      schemaType="Article"
    />
  );
}
