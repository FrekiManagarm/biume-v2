import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternatives aux logiciels ostéopathe animalier",
  description:
    "Comparez Biume, Animalib, Hunimalis, Stenko, MyTour, NeoVoice et MyPawScribe selon votre besoin: gestion, relances ou suivi.",
  path: "/comparatifs",
});

export default function ComparisonHubPage() {
  return (
    <SeoPage
      path="/comparatifs"
      eyebrow="Comparatifs logiciels"
      title={
        <>
          Alternatives aux logiciels pour{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            ostéopathe animalier
          </span>
        </>
      }
      description="Animalib, Hunimalis, Stenko, MyTour, NeoVoice et MyPawScribe répondent à des besoins différents. Biume se différencie par le compte rendu propriétaire, le suivi post-séance et la relance de suivi."
      stats={[
        { value: "7", label: "outils comparés" },
        { value: "1", label: "angle suivi" },
        { value: "FR", label: "marché ciblé" },
      ]}
      panel={{
        eyebrow: "Choisir",
        title: "Le bon outil dépend du problème prioritaire.",
        body: "Si votre sujet principal est l'agenda, la facturation ou les tournées, un logiciel de gestion peut être prioritaire. Si votre enjeu est que le propriétaire comprenne, se souvienne et revienne au bon moment, Biume devient plus pertinent.",
        items: [
          "Animalib et Hunimalis: gestion d'activité et dossiers.",
          "Stenko: relation professionnel-propriétaire plus large.",
          "Biume: résumé de séance, timeline animal et relances.",
        ],
      }}
      sections={[
        {
          eyebrow: "Animalib",
          title: "Animalib est fort sur la gestion d'activité.",
          body: "Animalib parle agenda, clients, consultations, facturation, rapports et usage mobile. Biume ne cherche pas à remplacer ce socle administratif: il se concentre sur le suivi propriétaire après la séance.",
        },
        {
          eyebrow: "Hunimalis",
          title: "Hunimalis couvre les professionnels animaliers avec une logique tout-en-un.",
          body: "Hunimalis peut convenir si vous voulez centraliser rendez-vous, visibilité, dossiers et facturation. Biume est plus étroit, mais plus précis sur le compte rendu propriétaire et la continuité post-séance.",
        },
        {
          eyebrow: "Stenko",
          title: "Stenko travaille la relation entre professionnels et propriétaires.",
          body: "Stenko est probablement le plus proche de la relation propriétaire. L'angle Biume reste différent: partir de la séance réelle, créer un résumé validé par le praticien et nourrir une timeline animal.",
        },
        {
          eyebrow: "MyTour",
          title: "MyTour répond surtout aux praticiens mobiles et aux tournées.",
          body: "Si l'enjeu est la route, les kilomètres et l'organisation terrain, MyTour a un angle naturel. Si l'enjeu est la compréhension du soin et la relance après la visite, Biume complète mieux ce flux.",
        },
        {
          eyebrow: "NeoVoice",
          title: "NeoVoice part davantage du propriétaire et du carnet animal.",
          body: "NeoVoice peut aider le propriétaire à centraliser des informations. Biume part de la séance du praticien pour créer un résumé validé, une timeline animal et une relance post-séance.",
        },
        {
          eyebrow: "MyPawScribe",
          title: "MyPawScribe est plus proche du scribe vétérinaire.",
          body: "Si votre recherche concerne une documentation clinique vétérinaire, MyPawScribe peut être plus naturel. Biume cible les thérapeutes animaliers et la communication propriétaire.",
        },
      ]}
      faq={[
        {
          question: "Biume est-il une alternative à Animalib ?",
          answer:
            "Biume peut être une alternative si votre besoin principal est le compte rendu propriétaire et le suivi post-séance. Pour la gestion complète d'activité, Animalib peut rester complémentaire.",
        },
        {
          question: "Pourquoi choisir Biume plutôt qu'un outil tout-en-un ?",
          answer:
            "Parce que Biume est spécialisé sur un moment précis: transformer une séance en résumé clair, feedback propriétaire, timeline animal et relance utile.",
        },
        {
          question: "Puis-je utiliser Biume avec un autre logiciel ?",
          answer:
            "Oui. Beaucoup de praticiens peuvent garder leur outil d'agenda ou de facturation et utiliser Biume pour professionnaliser le suivi propriétaire.",
        },
      ]}
      internalLinks={[
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu ostéopathe" },
        { href: "/alternatives/animalib", label: "Alternative Animalib" },
        { href: "/alternatives/stenko", label: "Alternative Stenko" },
        { href: "/alternatives/hunimalis", label: "Alternative Hunimalis" },
        { href: "/alternatives/mytour", label: "Alternative MyTour" },
        { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
        { href: "/alternatives/mypawscribe", label: "Alternative MyPawScribe" },
        { href: "/tarifs", label: "Tarifs" },
      ]}
    />
  );
}
