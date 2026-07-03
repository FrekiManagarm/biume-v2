import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative NeoVoice",
  description:
    "Alternative NeoVoice Pro: préparez une transition vers Biume pour vos comptes rendus, suivis post-séance et relances propriétaire.",
  path: "/alternatives/neovoice",
});

export default function NeoVoiceAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/neovoice"
      eyebrow="Alternative NeoVoice"
      title={
        <>
          Alternative NeoVoice pour garder le{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi post-séance
          </span>{" "}
          côté praticien
        </>
      }
      description="Vous cherchez une alternative NeoVoice Pro ou vous envisagez de changer d'outil ? Biume aide les praticiens animaliers à garder la continuité du suivi: comptes rendus, timeline animal et relances propriétaire."
      stats={[
        { value: "Migration", label: "douce" },
        { value: "Pro", label: "praticien" },
        { value: "15 j", label: "essai gratuit" },
      ]}
      panel={{
        eyebrow: "Migration",
        title: "Préparer une transition sans casser votre suivi client.",
        body: "Si vous utilisez NeoVoice Pro et que vous comparez d'autres solutions, Biume peut prendre le relais sur la partie compte rendu, timeline animal et suivi post-séance.",
        items: [
          "Identifier les suivis actifs et les comptes rendus à conserver.",
          "Recréer votre flux post-séance à partir des cas importants.",
          "Tester Biume sur quelques clients avant de migrer toute votre pratique.",
        ],
      }}
      sections={[
        {
          eyebrow: "Transition",
          title: "Changer d'outil est le bon moment pour clarifier votre suivi.",
          body: "Avant de basculer vers une alternative NeoVoice, listez ce que vous voulez vraiment préserver: comptes rendus, historiques animal, retours propriétaire et relances importantes.",
        },
        {
          eyebrow: "Pourquoi migrer",
          title: "Quand votre priorité devient la continuité du suivi.",
          body: "Un changement d'outil est le bon moment pour clarifier ce que vous voulez préserver: les informations animal, les comptes rendus, les retours propriétaire et les prochaines étapes après séance.",
        },
        {
          eyebrow: "NeoVoice",
          title: "NeoVoice partait surtout du carnet et du propriétaire.",
          body: "NeoVoice a été présenté comme un carnet de santé numérique, un suivi propriétaire et un pont vers les professionnels. Biume prend un angle plus spécialisé: partir de la séance du praticien pour produire un suivi exploitable.",
        },
        {
          eyebrow: "Biume",
          title: "Biume cible les ostéopathes et thérapeutes animaliers.",
          body: "Biume vous aide à transformer vos observations en compte rendu propriétaire, garder une timeline animal et relancer le propriétaire au bon moment, sans remplacer votre validation professionnelle.",
        },
        {
          eyebrow: "Transition",
          title: "Tester avant de basculer toute votre pratique.",
          body: "Vous pouvez démarrer avec quelques vraies séances: un résumé propriétaire, une timeline animal et une relance de suivi. Si le flux vous convient, vous migrez progressivement votre communication post-séance.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il toutes les fonctions de NeoVoice ?",
          answer:
            "Non. Biume n'est pas un carnet propriétaire généraliste. C'est une alternative plus spécialisée pour le compte rendu, la timeline de séance et le suivi post-séance côté praticien.",
        },
        {
          question: "Puis-je migrer depuis NeoVoice vers Biume ?",
          answer:
            "Oui, si votre besoin principal est de recréer un flux de suivi: compte rendu propriétaire, historique par animal et relances. Le plus simple est de tester Biume sur quelques séances récentes.",
        },
        {
          question: "Comment préparer une transition depuis NeoVoice Pro ?",
          answer:
            "Commencez par vos suivis actifs, vos comptes rendus récents et les clients à relancer. Biume peut ensuite vous aider à reconstruire le flux compte rendu, suivi animal et relance propriétaire.",
        },
      ]}
      internalLinks={[
        { href: "/blog/migrer-depuis-neovoice-pro", label: "Guide de migration NeoVoice" },
        { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/tarifs", label: "Tester Biume" },
      ]}
    />
  );
}
