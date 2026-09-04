import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternatives aux logiciels ostéopathe animalier",
  description:
    "Comparez Biume à Animalib, Hunimalis, Kiwi Appli, Stenko, MyTour, NeoVoice et MyPawScribe pour ostéopathe animalier: agenda, patients, comptes rendus et suivi.",
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
      description="Animalib, Hunimalis, Kiwi Appli, Stenko, MyTour, NeoVoice et MyPawScribe répondent à des besoins différents. Biume couvre agenda, propriétaires, patients animaux, documents, comptes rendus et suivi post-séance."
      stats={[
        { value: "8", label: "outils comparés" },
        { value: "1", label: "socle Biume" },
        { value: "FR", label: "marché ciblé" },
      ]}
      panel={{
        eyebrow: "Choisir",
        title: "Le bon outil dépend du problème prioritaire.",
        body: "Biume couvre aussi un socle métier: agenda, propriétaires, patients animaux, documents et comptes rendus. Sa différence est de relier cette gestion à un suivi propriétaire clair après la séance.",
        items: [
          "Animalib et Hunimalis: gestion d'activité et dossiers.",
          "Kiwi Appli: fiches clients, comptes rendus, factures, ressources métier.",
          "Stenko: relation professionnel-propriétaire plus large.",
          "Biume: agenda, propriétaires, patients, résumé de séance et relances.",
        ],
      }}
      sections={[
        {
          eyebrow: "Animalib",
          title: "Animalib est fort sur la gestion d'activité.",
          body: "Animalib parle agenda, clients, consultations, facturation, rapports et usage mobile. Biume couvre aussi agenda, propriétaires et patients, avec un angle plus marqué sur le résumé propriétaire et le suivi après la séance.",
        },
        {
          eyebrow: "Hunimalis",
          title: "Hunimalis couvre les professionnels animaliers avec une logique tout-en-un.",
          body: "Hunimalis peut convenir si vous voulez centraliser rendez-vous, visibilité, dossiers et facturation. Biume couvre agenda, propriétaires, patients, documents et comptes rendus, avec un flux très clair pour la continuité post-séance.",
        },
        {
          eyebrow: "Kiwi Appli",
          title: "Kiwi Appli couvre la gestion et les comptes rendus de consultation.",
          body: "Kiwi Appli peut convenir si vous cherchez fiches clients, comptes rendus, facturation et ressources métier. Biume couvre aussi agenda, propriétaires et patients, puis ajoute un flux fort autour du résumé propriétaire, de la timeline animal et de la relance de suivi.",
        },
        {
          eyebrow: "Stenko",
          title: "Stenko travaille la relation entre professionnels et propriétaires.",
          body: "Stenko est probablement le plus proche de la relation propriétaire. L'angle Biume reste différent: partir de la séance réelle, créer un résumé validé par le praticien et nourrir une timeline animal.",
        },
        {
          eyebrow: "MyTour",
          title: "MyTour répond surtout aux praticiens mobiles et aux tournées.",
          body: "Si l'enjeu est la route, les kilomètres et l'organisation terrain, MyTour a un angle naturel. Biume organise le socle de suivi du praticien: agenda, propriétaires, patients animaux, compte rendu et relance après la visite.",
        },
        {
          eyebrow: "NeoVoice",
          title: "NeoVoice part davantage du propriétaire et du carnet animal.",
          body: "NeoVoice peut aider le propriétaire à centraliser des informations. Biume part du praticien avec agenda, propriétaires, patients, résumé validé, timeline animal et relance post-séance.",
        },
        {
          eyebrow: "MyPawScribe",
          title: "MyPawScribe est plus proche du scribe vétérinaire.",
          body: "Si votre recherche concerne une documentation clinique vétérinaire, MyPawScribe peut être plus naturel. Biume cible les thérapeutes animaliers avec agenda, propriétaires, patients, documents et communication propriétaire.",
        },
      ]}
      faq={[
        {
          question: "Biume est-il une alternative à Animalib ?",
          answer:
            "Oui, si vous cherchez un espace de travail centré praticien avec agenda, propriétaires, patients, documents, comptes rendus et suivi post-séance.",
        },
        {
          question: "Pourquoi choisir Biume plutôt qu'un outil tout-en-un ?",
          answer:
            "Parce que Biume relie la gestion quotidienne de votre activité à la continuité après séance: résumé clair, feedback propriétaire, timeline animal et relance utile.",
        },
        {
          question: "Puis-je utiliser Biume avec un autre logiciel ?",
          answer:
            "Oui. Vous pouvez tester Biume sur un flux réel: rendez-vous, propriétaire, patient animal, document, compte rendu et suivi propriétaire.",
        },
      ]}
      internalLinks={[
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu ostéopathe" },
        { href: "/alternatives/animalib", label: "Alternative Animalib" },
        { href: "/alternatives/stenko", label: "Alternative Stenko" },
        { href: "/alternatives/hunimalis", label: "Alternative Hunimalis" },
        { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
        { href: "/alternatives/mytour", label: "Alternative MyTour" },
        { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
        { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
        { href: "/alternatives/mypawscribe", label: "Alternative MyPawScribe" },
        { href: "/tarifs", label: "Tarifs" },
      ]}
    />
  );
}
