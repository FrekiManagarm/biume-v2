import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative MyTour",
  description:
    "Comparez MyTour et Biume: tournées, kilomètres et facturation côté MyTour; suivi post-séance et résumé propriétaire côté Biume.",
  path: "/alternatives/mytour",
});

export default function MyTourAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/mytour"
      eyebrow="Alternative MyTour"
      title={
        <>
          Alternative MyTour pour le{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi post-séance
          </span>
        </>
      }
      description="MyTour est pertinent pour les professionnels animaliers mobiles qui veulent gérer tournées, kilomètres et facturation. Biume cible un autre moment: le suivi propriétaire après la séance."
      stats={[
        { value: "Route", label: "MyTour" },
        { value: "Suivi", label: "Biume" },
        { value: "J+7", label: "retour client" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "MyTour organise vos déplacements, Biume organise l'après-séance.",
        body: "Les deux besoins peuvent coexister. MyTour répond au quotidien terrain; Biume aide le propriétaire à comprendre la séance et à revenir vers vous au bon moment.",
        items: [
          "MyTour: tournées, kilomètres, facturation et organisation mobile.",
          "Biume: compte rendu propriétaire et timeline animal.",
          "Usage possible: MyTour pour la route, Biume pour le suivi.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir MyTour",
          title: "Quand votre priorité est l'organisation des tournées.",
          body: "MyTour est plus naturel si votre enjeu principal est de planifier vos déplacements, suivre les frais kilométriques, organiser les visites et fluidifier la partie administrative terrain.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand vous voulez mieux valoriser chaque visite après coup.",
          body: "Biume transforme vos observations en résumé propriétaire, conserve l'évolution dans une timeline animal et prépare une relance de suivi lorsque vous la jugez pertinente.",
        },
        {
          eyebrow: "Différence",
          title: "Biume ne remplace pas un outil de tournée.",
          body: "Biume complète le travail terrain en rendant la séance plus mémorable pour le propriétaire: points observés, conseils transmis, éléments à surveiller et prochaine étape.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il MyTour ?",
          answer:
            "Non si votre besoin principal est la tournée ou les kilomètres. Biume peut compléter MyTour pour le compte rendu propriétaire et le suivi post-séance.",
        },
        {
          question: "Biume convient-il aux praticiens mobiles ?",
          answer:
            "Oui. Biume est adapté aux praticiens mobiles qui veulent envoyer un résumé clair après chaque visite et garder une timeline animal.",
        },
        {
          question: "Pourquoi créer une page alternative MyTour ?",
          answer:
            "Parce que certains praticiens comparent leurs outils. Biume doit clarifier son rôle: suivi après la séance, pas gestion de tournée.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
      ]}
    />
  );
}
