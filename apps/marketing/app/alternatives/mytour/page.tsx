import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative MyTour",
  description:
    "Comparez MyTour et Biume: tournées côté MyTour; agenda, propriétaires, patients et suivi post-séance côté Biume pour praticiens mobiles.",
  path: "/alternatives/mytour",
});

export default function MyTourAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/mytour"
      eyebrow="Alternative MyTour"
      title={
        <>
          Alternative MyTour pour organiser le{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi praticien
          </span>
        </>
      }
      description="MyTour est pertinent pour les professionnels animaliers mobiles qui veulent gérer tournées, kilomètres et facturation. Biume couvre agenda, propriétaires, patients et suivi propriétaire après la séance."
      stats={[
        { value: "Route", label: "MyTour" },
        { value: "Agenda", label: "Biume" },
        { value: "J+7", label: "retour client" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "MyTour organise les tournées, Biume organise le suivi de séance.",
        body: "MyTour répond au quotidien terrain. Biume couvre le flux praticien autour du rendez-vous: agenda, propriétaires, patients animaux, documents, compte rendu et relance au bon moment.",
        items: [
          "MyTour: tournées, kilomètres, facturation et organisation mobile.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: compte rendu propriétaire, timeline animal et relances.",
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
          title: "Biume transforme la visite en suivi exploitable.",
          body: "Biume rend la séance plus mémorable pour le propriétaire: rendez-vous, patient animal, points observés, conseils transmis, éléments à surveiller et prochaine étape.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il MyTour ?",
          answer:
            "Biume répond au besoin si votre priorité est agenda, propriétaires, patients, documents, compte rendu propriétaire et suivi post-séance.",
        },
        {
          question: "Biume convient-il aux praticiens mobiles ?",
          answer:
            "Oui. Biume est adapté aux praticiens mobiles qui veulent envoyer un résumé clair après chaque visite et garder une timeline animal.",
        },
        {
          question: "Pourquoi créer une page alternative MyTour ?",
          answer:
            "Parce que certains praticiens comparent leurs outils. Biume clarifie son rôle: organiser le suivi du praticien autour du rendez-vous, du patient animal et de la relation propriétaire.",
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
