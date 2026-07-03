import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Kiwi Appli",
  description:
    "Alternative Kiwi Appli pour ostéopathes animaliers: comparez agenda, propriétaires, patients, comptes rendus et suivi post-séance avec Biume.",
  path: "/alternatives/kiwiappli",
});

export default function KiwiAppliAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/kiwiappli"
      eyebrow="Alternative Kiwi Appli"
      title={
        <>
          Alternative Kiwi Appli pour renforcer le{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            résumé propriétaire
          </span>
        </>
      }
      description="Kiwi Appli aide les ostéopathes animaliers à gérer fiches clients, comptes rendus, factures et ressources métier. Biume propose aussi agenda, propriétaires et patients, avec un angle fort sur le résumé propriétaire et la relance post-séance."
      stats={[
        { value: "Agenda", label: "Biume" },
        { value: "Patients", label: "Biume" },
        { value: "J+7", label: "relance" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Kiwi Appli et Biume couvrent la gestion, Biume insiste sur l'après-séance.",
        body: "Le bon choix dépend de votre priorité. Kiwi Appli met en avant la gestion quotidienne et le compte rendu de consultation. Biume couvre aussi agenda, propriétaires et patients, puis relie ce socle à la compréhension propriétaire et à la continuité après rendez-vous.",
        items: [
          "Kiwi Appli: fiches clients, comptes rendus, factures, encyclopédie.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: timeline animal et relances post-séance.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir Kiwi Appli",
          title: "Quand votre besoin principal est la gestion de consultation.",
          body: "Kiwi Appli est pertinent si vous cherchez un outil mobile pour créer des fiches clients, renseigner les animaux, produire des comptes rendus et gérer une partie administrative de votre activité.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand vous voulez gestion métier et communication propriétaire.",
          body: "Biume est pertinent si vous voulez gérer agenda, propriétaires, patients animaux et documents, tout en transformant vos observations en résumé propriétaire clair et en relance utile après la séance.",
        },
        {
          eyebrow: "Différence",
          title: "Le compte rendu n'a pas le même rôle selon l'outil.",
          body: "Dans une logique de gestion, le compte rendu documente la consultation. Dans Biume, il devient aussi un support de compréhension, de suivi et de continuité pour le propriétaire.",
        },
        {
          eyebrow: "Essai",
          title: "Vous pouvez tester Biume sur un flux complet.",
          body: "Testez Biume sur quelques rendez-vous: agenda, propriétaire, patient animal, compte rendu, résumé propriétaire et relance J+7. Vous verrez vite si le flux convient à votre pratique.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il Kiwi Appli ?",
          answer:
            "Biume peut devenir votre espace de travail si vous voulez couvrir agenda, propriétaires, patients animaux, documents, compte rendu et suivi post-séance, avec un accent fort sur la compréhension propriétaire.",
        },
        {
          question: "Quelle alternative choisir pour les comptes rendus ?",
          answer:
            "Biume est pertinent si vous voulez relier le document de consultation à un résumé propriétaire, une timeline animal et une relance de suivi.",
        },
        {
          question: "Puis-je tester Biume avec mes outils actuels ?",
          answer:
            "Oui. Vous pouvez tester Biume sur quelques vraies séances et comparer le flux complet: rendez-vous, propriétaire, patient, compte rendu et suivi après séance.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/tarifs", label: "Tester Biume" },
      ]}
    />
  );
}
