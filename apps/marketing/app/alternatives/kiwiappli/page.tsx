import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Kiwi Appli",
  description:
    "Alternative Kiwi Appli pour ostéopathes animaliers: comparez gestion, comptes rendus, résumé propriétaire et suivi post-séance avec Biume.",
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
      description="Kiwi Appli aide les ostéopathes animaliers à gérer fiches clients, comptes rendus, factures et ressources métier. Biume se concentre sur le compte rendu propriétaire, la timeline animal et la relance post-séance."
      stats={[
        { value: "Gestion", label: "Kiwi Appli" },
        { value: "Suivi", label: "Biume" },
        { value: "J+7", label: "relance" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Kiwi Appli structure la consultation, Biume prolonge la séance.",
        body: "Le bon choix dépend de votre priorité. Kiwi Appli met en avant la gestion quotidienne et le compte rendu de consultation. Biume travaille surtout la compréhension propriétaire et la continuité après rendez-vous.",
        items: [
          "Kiwi Appli: fiches clients, comptes rendus, factures, encyclopédie.",
          "Biume: résumé propriétaire validé par le praticien.",
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
          title: "Quand votre enjeu est la communication propriétaire après la séance.",
          body: "Biume est plus spécialisé si vous voulez transformer vos observations en résumé propriétaire clair, garder une timeline animal et préparer une relance utile après la séance.",
        },
        {
          eyebrow: "Différence",
          title: "Le compte rendu n'a pas le même rôle selon l'outil.",
          body: "Dans une logique de gestion, le compte rendu documente la consultation. Dans Biume, il devient aussi un support de compréhension, de suivi et de continuité pour le propriétaire.",
        },
        {
          eyebrow: "Complément",
          title: "Vous pouvez tester Biume sans changer tout votre back-office.",
          body: "Si Kiwi Appli couvre déjà votre organisation, Biume peut être testé sur quelques séances où le résumé propriétaire, la relance J+7 ou la timeline animal sont les plus utiles.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il Kiwi Appli ?",
          answer:
            "Pas forcément. Biume peut compléter Kiwi Appli si votre priorité est de renforcer la compréhension propriétaire, la timeline animal et le suivi post-séance.",
        },
        {
          question: "Quelle alternative choisir pour les comptes rendus ?",
          answer:
            "Si vous cherchez surtout à produire un document de consultation, Kiwi Appli peut convenir. Si vous voulez un résumé propriétaire relié à une relance et à une timeline, Biume est plus spécialisé.",
        },
        {
          question: "Puis-je tester Biume avec mes outils actuels ?",
          answer:
            "Oui. Vous pouvez tester Biume sur quelques vraies séances sans changer immédiatement votre agenda, votre facturation ou votre organisation existante.",
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
