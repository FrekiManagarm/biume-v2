import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative à Animalib pour ostéopathe animalier",
  description:
    "Comparez Animalib et Biume: agenda, propriétaires, patients, documents, comptes rendus, relances et suivi post-séance pour praticiens animaliers.",
  path: "/alternatives/animalib",
});

export default function AnimalibAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/animalib"
      eyebrow="Alternative Animalib"
      title={
        <>
          Alternative Animalib pour gérer et{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivre vos séances
          </span>
        </>
      }
      description="Animalib est un outil utile pour gérer l'activité d'un ostéopathe animalier. Biume propose aussi agenda, propriétaires, patients, documents et comptes rendus, avec un flux fort de suivi post-séance."
      stats={[
        { value: "Agenda", label: "Biume" },
        { value: "Patients", label: "Biume" },
        { value: "15 j", label: "essai gratuit" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Biume relie gestion métier et continuité propriétaire.",
        body: "Le choix dépend de votre priorité. Biume couvre le socle agenda, propriétaires, patients animaux, documents et comptes rendus, puis transforme chaque séance en suivi clair pour le propriétaire.",
        items: [
          "Animalib: gestion d'activité, agenda, clients, consultations.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: compte rendu propriétaire, timeline animal et relances.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir Animalib",
          title: "Quand votre problème principal est administratif.",
          body: "Animalib est plus naturel si vous cherchez d'abord à organiser vos rendez-vous, vos clients, vos consultations et votre facturation dans un outil de gestion métier.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand votre enjeu est de gérer et faire comprendre.",
          body: "Biume est conçu pour gérer vos rendez-vous, propriétaires, patients animaux et documents, puis transformer vos observations en résumé propriétaire et relances J+7 ou J+30.",
        },
        {
          eyebrow: "Différence",
          title: "La différence Biume est la continuité après rendez-vous.",
          body: "Le produit garde le fil entre agenda, dossier animal, compte rendu, évolution et prochaine étape, pour aider le propriétaire à comprendre et revenir vers vous au bon moment.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il Animalib ?",
          answer:
            "Biume peut devenir votre espace de travail si votre priorité est agenda, propriétaires, patients, documents, comptes rendus et suivi post-séance.",
        },
        {
          question: "Quelle alternative choisir pour les comptes rendus ?",
          answer:
            "Biume est pertinent si vous voulez relier le compte rendu à un patient animal, un propriétaire, une timeline et une relance de suivi.",
        },
        {
          question: "Puis-je tester Biume sur quelques séances ?",
          answer:
            "Oui. Vous pouvez tester Biume sur quelques vraies séances avec le flux complet: rendez-vous, propriétaire, patient, compte rendu et suivi.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
      ]}
    />
  );
}
