import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative à Stenko pour ostéopathe animalier",
  description:
    "Comparez Stenko et Biume: agenda, propriétaires, patients, documents, résumé propriétaire et timeline animal côté Biume pour praticiens.",
  path: "/alternatives/stenko",
});

export default function StenkoAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/stenko"
      eyebrow="Alternative Stenko"
      title={
        <>
          Alternative Stenko pour un{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi praticien
          </span>
        </>
      }
      description="Stenko travaille la relation entre professionnels et propriétaires d'animaux. Biume couvre agenda, propriétaires, patients, documents, résumé propriétaire et suivi post-séance."
      stats={[
        { value: "Relation", label: "Stenko" },
        { value: "Agenda", label: "Biume" },
        { value: "J+7", label: "retour suivi" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Stenko relie les acteurs, Biume part de la séance.",
        body: "Stenko peut convenir pour une logique plus large entre professionnels et propriétaires. Biume démarre du rendez-vous, relie agenda, propriétaires et patients, puis transforme ce moment en suivi compréhensible.",
        items: [
          "Stenko: relation pro-propriétaire et outils de gestion.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: relances et timeline animal centrées sur l'évolution.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir Stenko",
          title: "Quand vous cherchez une plateforme de relation plus large.",
          body: "Stenko peut être pertinent si votre besoin couvre plusieurs interactions entre professionnels et propriétaires, avec une logique plus générale d'application métier.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand vous voulez mieux valoriser chaque séance.",
          body: "Biume vous aide à partir de vos observations pour créer un résumé propriétaire clair, conserver les retours et préparer la prochaine étape.",
        },
        {
          eyebrow: "Différence",
          title: "Biume transforme la gestion en continuité de soin.",
          body: "L'objectif est de garder un fil clair entre rendez-vous, dossier animal, observations, compte rendu propriétaire et prochaine étape validée par le praticien.",
        },
      ]}
      faq={[
        {
          question: "Biume est-il une alternative à Stenko ?",
          answer:
            "Oui si votre priorité est de gérer agenda, propriétaires, patients animaux, comptes rendus et suivi post-séance dans un flux pensé pour le praticien.",
        },
        {
          question: "Quelle différence pour le propriétaire ?",
          answer:
            "Biume envoie surtout un résumé clair de la séance, les points à surveiller et les prochaines étapes validées par le praticien.",
        },
        {
          question: "Biume aide-t-il à relancer les propriétaires ?",
          answer:
            "Oui. Biume aide à préparer les relances J+7 ou J+30 quand elles sont pertinentes dans votre suivi.",
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
