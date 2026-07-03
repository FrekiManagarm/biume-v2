import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Hunimalis",
  description:
    "Comparez Hunimalis et Biume: agenda, propriétaires, patients, documents, comptes rendus et suivi post-séance pour thérapeutes animaliers.",
  path: "/alternatives/hunimalis",
});

export default function HunimalisAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/hunimalis"
      eyebrow="Alternative Hunimalis"
      title={
        <>
          Alternative Hunimalis pour gérer vos{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivis propriétaire
          </span>
        </>
      }
      description="Hunimalis est orienté gestion d'activité pour professionnels animaliers. Biume couvre agenda, propriétaires, patients, documents, comptes rendus et suivi post-séance des praticiens manuels."
      stats={[
        { value: "Agenda", label: "Biume" },
        { value: "Patients", label: "Biume" },
        { value: "PDF", label: "propriétaire" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Biume centralise le suivi et rend la séance lisible.",
        body: "Si vous comparez Hunimalis et Biume, regardez le flux complet: agenda, propriétaires, patients animaux, documents, comptes rendus et continuité après chaque rendez-vous.",
        items: [
          "Hunimalis: rendez-vous, dossiers, visibilité et gestion.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
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
          title: "Quand vous voulez gérer le dossier et prolonger la séance.",
          body: "Biume relie le rendez-vous, le propriétaire, le patient animal, les documents et le compte rendu. Le praticien garde la validation finale, l'outil apporte la régularité.",
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
            "Biume peut répondre au besoin si vous cherchez agenda, propriétaires, patients, documents, comptes rendus et suivi post-séance dans un même espace.",
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
