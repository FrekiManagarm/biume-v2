import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Modèle compte rendu ostéopathe animalier",
  description:
    "Découvrez un modèle de compte rendu pour ostéopathe animalier: résumé propriétaire, points observés, conseils transmis et suivi post-séance.",
  path: "/modele-compte-rendu-osteopathe-animalier",
});

export default function TemplateReportPage() {
  return (
    <SeoPage
      path="/modele-compte-rendu-osteopathe-animalier"
      eyebrow="Modèle compte rendu"
      title={
        <>
          Un modèle de compte rendu pour{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            ostéopathe animalier
          </span>
        </>
      }
      description="Un bon modèle compte rendu ostéopathe animalier doit aider le propriétaire à comprendre la séance sans transformer vos notes en diagnostic autonome. Biume structure le résumé propriétaire, les points observés et la prochaine étape."
      stats={[
        { value: "6", label: "sections utiles" },
        { value: "1", label: "résumé propriétaire" },
        { value: "J+7", label: "suivi conseillé" },
      ]}
      panel={{
        eyebrow: "Structure",
        title: "Le modèle doit guider sans enfermer votre pratique.",
        body: "Biume propose une base claire, puis vous gardez la main sur le vocabulaire, les nuances et la validation finale.",
        items: [
          "Contexte de la séance et motif de consultation.",
          "Points observés: confort, mobilité, zones et évolution.",
          "Conseils transmis, à surveiller et relance de suivi.",
        ],
      }}
      sections={[
        {
          eyebrow: "Objectif",
          title: "Aider le propriétaire à retenir l'essentiel.",
          body: "Le modèle ne doit pas seulement archiver vos observations. Il doit aider le propriétaire à comprendre ce qui a été vu, ce qu'il peut observer après la séance et pourquoi un suivi peut être utile.",
        },
        {
          eyebrow: "Sections",
          title: "Les blocs à prévoir dans votre compte rendu.",
          body: "Prévoyez un résumé de séance, les points observés, les zones travaillées, les conseils transmis par le praticien, les éléments à surveiller et la prochaine étape. Biume transforme ces blocs en compte rendu propriétaire plus lisible.",
        },
        {
          eyebrow: "Clarté",
          title: "Un modèle court convertit mieux qu'un long document.",
          body: "Un propriétaire lit plus facilement un résumé structuré qu'un rapport trop technique. L'enjeu est de rendre la valeur de la séance visible, pas d'ajouter des pages inutiles.",
        },
        {
          eyebrow: "Biume",
          title: "Votre modèle devient un flux de suivi.",
          body: "Avec Biume, le modèle ne s'arrête pas au PDF: il nourrit la timeline animal et prépare les relances J+7 ou J+30 lorsque vous les jugez pertinentes.",
        },
      ]}
      faq={[
        {
          question: "Quel est le meilleur format pour un compte rendu ?",
          answer:
            "Le meilleur format est court, structuré et validé par le praticien. Il doit combiner points observés, conseils transmis et prochaine étape compréhensible.",
        },
        {
          question: "Faut-il tout détailler dans le rapport ?",
          answer:
            "Non. Le propriétaire a surtout besoin d'un résumé clair et de repères concrets. Les détails professionnels peuvent rester dans vos notes internes.",
        },
        {
          question: "Biume impose-t-il un modèle unique ?",
          answer:
            "Non. Biume fournit une structure et des formulations, mais vous gardez votre vocabulaire métier et la validation finale.",
        },
      ]}
      internalLinks={[
        { href: "/exemple-compte-rendu-osteopathie-animale", label: "Voir un exemple" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Créer un compte rendu" },
        { href: "/logiciel-osteopathe-animalier", label: "Découvrir Biume" },
      ]}
      schemaType="Article"
    />
  );
}
