import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Hunimalis",
  description:
    "Comparez Hunimalis et Biume: gestion tout-en-un côté Hunimalis, compte rendu propriétaire et suivi post-séance côté Biume.",
  path: "/alternatives/hunimalis",
});

export default function HunimalisAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/hunimalis"
      eyebrow="Alternative Hunimalis"
      title={
        <>
          Alternative Hunimalis pour vos{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            comptes rendus propriétaire
          </span>
        </>
      }
      description="Hunimalis est orienté gestion d'activité pour professionnels animaliers. Biume cible le compte rendu propriétaire, la timeline animal et le suivi post-séance des praticiens manuels."
      stats={[
        { value: "Tout-en-un", label: "Hunimalis" },
        { value: "Suivi", label: "Biume" },
        { value: "PDF", label: "propriétaire" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Hunimalis centralise, Biume approfondit l'après-séance.",
        body: "Si vous voulez un logiciel large de gestion, Hunimalis peut répondre. Si vous voulez rendre vos séances plus lisibles après coup, Biume est plus ciblé.",
        items: [
          "Hunimalis: rendez-vous, dossiers, visibilité et gestion.",
          "Biume: compte rendu propriétaire après la séance.",
          "Biume: relances et évolution par animal.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir Hunimalis",
          title: "Quand vous cherchez une suite de gestion plus complète.",
          body: "Hunimalis peut convenir aux professionnels qui veulent centraliser une grande partie de leur activité, de la prise de rendez-vous à la gestion client.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand vos clients ne retiennent pas tout ce que vous expliquez.",
          body: "Biume transforme la séance en compte rendu propriétaire clair et en suivi concret. Le praticien garde la validation finale, l'outil apporte la régularité.",
        },
        {
          eyebrow: "Différence",
          title: "Le levier Biume est la confiance après rendez-vous.",
          body: "Biume aide le propriétaire à comprendre les points observés, à surveiller l'évolution et à reprendre contact au bon moment.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il Hunimalis ?",
          answer:
            "Pas nécessairement. Biume peut compléter un outil de gestion si votre enjeu est surtout le compte rendu propriétaire et le suivi post-séance.",
        },
        {
          question: "Biume convient-il aux thérapeutes animaliers indépendants ?",
          answer:
            "Oui. Biume est pensé pour les praticiens indépendants qui veulent professionnaliser la communication après chaque séance.",
        },
        {
          question: "Puis-je essayer Biume avant de payer ?",
          answer:
            "Oui. L'essai gratuit dure 15 jours et ne demande pas de carte bancaire.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
        { href: "/tarifs", label: "Tarifs Biume" },
      ]}
    />
  );
}
