import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative Stenko",
  description:
    "Comparez Stenko et Biume: relation pro-propriétaire large côté Stenko, résumé propriétaire et timeline animal côté Biume.",
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
            suivi plus spécialisé
          </span>
        </>
      }
      description="Stenko travaille la relation entre professionnels et propriétaires d'animaux. Biume se spécialise dans le résumé propriétaire, la timeline animal et le suivi post-séance validé par le praticien."
      stats={[
        { value: "Relation", label: "Stenko" },
        { value: "Séance", label: "Biume" },
        { value: "J+7", label: "retour suivi" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Stenko relie les acteurs, Biume part de la séance.",
        body: "Stenko peut convenir pour une logique plus large entre professionnels et propriétaires. Biume démarre du rendez-vous et transforme ce moment en suivi compréhensible.",
        items: [
          "Stenko: relation pro-propriétaire et outils de gestion.",
          "Biume: résumé de séance et compte rendu propriétaire.",
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
          title: "Biume est plus étroit, donc plus précis.",
          body: "L'objectif n'est pas de tout couvrir. L'objectif est que le propriétaire comprenne mieux, garde une trace et revienne vers vous au bon moment.",
        },
      ]}
      faq={[
        {
          question: "Biume est-il une alternative à Stenko ?",
          answer:
            "Oui si votre priorité est le suivi post-séance et le compte rendu propriétaire. Pour une plateforme plus large, Stenko peut rester complémentaire.",
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
