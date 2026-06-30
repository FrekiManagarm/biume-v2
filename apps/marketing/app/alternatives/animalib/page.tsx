import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Animalib",
  description:
    "Comparez Animalib et Biume: gestion d'activité côté Animalib, suivi post-séance, résumé propriétaire et relances côté Biume.",
  path: "/alternatives/animalib",
});

export default function AnimalibAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/animalib"
      eyebrow="Alternative Animalib"
      title={
        <>
          Alternative Animalib pour le{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi post-séance
          </span>
        </>
      }
      description="Animalib est un outil utile pour gérer l'activité d'un ostéopathe animalier. Biume se concentre sur un autre levier: le résumé propriétaire, la timeline animal et la relance de suivi."
      stats={[
        { value: "Admin", label: "Animalib" },
        { value: "Suivi", label: "Biume" },
        { value: "15 j", label: "essai gratuit" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Animalib pour gérer, Biume pour faire comprendre.",
        body: "Le choix dépend de votre priorité. Si vous cherchez un socle d'agenda et facturation, Animalib peut être pertinent. Si vous voulez professionnaliser l'après-séance, Biume a un angle plus spécialisé.",
        items: [
          "Animalib: gestion d'activité, agenda, clients, consultations.",
          "Biume: compte rendu propriétaire et suivi post-séance.",
          "Usage possible: garder Animalib et ajouter Biume au suivi.",
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
          title: "Quand votre enjeu est la relation propriétaire après la séance.",
          body: "Biume est conçu pour transformer vos observations en résumé propriétaire, garder une timeline animal et préparer les relances J+7 ou J+30.",
        },
        {
          eyebrow: "Différence",
          title: "Biume ne cherche pas à être un back-office complet.",
          body: "Cette spécialisation évite de diluer la promesse: aider le propriétaire à comprendre l'évolution et vous aider à garder un suivi plus professionnel.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il Animalib ?",
          answer:
            "Pas forcément. Biume peut compléter Animalib si vous voulez renforcer le compte rendu propriétaire et la relance post-séance.",
        },
        {
          question: "Quelle alternative choisir pour les comptes rendus ?",
          answer:
            "Si votre priorité est le résumé propriétaire et la continuité du suivi, Biume est plus spécialisé sur ce besoin.",
        },
        {
          question: "Puis-je tester Biume sans changer d'outil ?",
          answer:
            "Oui. Vous pouvez tester Biume sur quelques vraies séances sans changer votre agenda ou votre facturation.",
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
