import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "NeoVoice vs Biume",
  description:
    "NeoVoice vs Biume: carnet côté propriétaire; agenda, propriétaires, patients, comptes rendus et suivi côté praticien avec Biume.",
  path: "/comparatifs/neovoice-vs-biume",
});

export default function NeoVoiceComparisonPage() {
  return (
    <SeoPage
      path="/comparatifs/neovoice-vs-biume"
      eyebrow="NeoVoice vs Biume"
      title={
        <>
          NeoVoice vs Biume: propriétaire ou{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            praticien
          </span>
          , quel point de départ ?
        </>
      }
      description="NeoVoice aide les propriétaires à centraliser le suivi de leur animal. Biume part du praticien: agenda, propriétaires, patients, résumé propriétaire, timeline animal et relance post-séance."
      stats={[
        { value: "Owner", label: "NeoVoice" },
        { value: "Agenda", label: "Biume" },
        { value: "J+7", label: "retour suivi" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "NeoVoice centralise le carnet, Biume transforme la séance.",
        body: "NeoVoice peut être utile pour le propriétaire qui veut suivre son animal. Biume aide le praticien à gérer agenda, propriétaires, patients animaux et documents, puis à produire un suivi clair à partir de la séance réelle.",
        items: [
          "NeoVoice: carnet, documents, rappels et suivi propriétaire.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: relances et timeline centrées sur l'évolution observée.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir NeoVoice",
          title: "Quand le besoin vient surtout du propriétaire.",
          body: "NeoVoice est pertinent si le sujet principal est de centraliser les informations de l'animal, les documents, les rappels et le suivi côté propriétaire.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand le besoin part de la séance du praticien.",
          body: "Biume est adapté si vous voulez relier agenda, propriétaire, patient animal et observations, puis transformer la séance en compte rendu propriétaire et relance utile.",
        },
        {
          eyebrow: "Différence",
          title: "Le point de départ change la valeur produite.",
          body: "Un carnet propriétaire centralise. Un suivi Biume raconte ce qui s'est passé pendant la séance, avec les mots et la validation du praticien.",
        },
      ]}
      faq={[
        {
          question: "NeoVoice et Biume répondent-ils au même besoin ?",
          answer:
            "NeoVoice part plutôt du propriétaire et du carnet de suivi. Biume part du praticien avec agenda, propriétaires, patients animaux et suivi post-séance.",
        },
        {
          question: "Biume crée-t-il un carnet animal complet ?",
          answer:
            "Biume garde une timeline animal centrée sur les séances, points observés, retours propriétaire et relances. Ce n'est pas un carnet propriétaire généraliste.",
        },
        {
          question: "Pour qui Biume est-il pensé ?",
          answer:
            "Pour les ostéopathes animaliers et praticiens manuels qui veulent envoyer un résumé propriétaire clair après chaque séance.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
      ]}
    />
  );
}
