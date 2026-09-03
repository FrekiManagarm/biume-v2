import type { Metadata } from "next";
import { SeoPage } from "../../../components/seo-page";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alternative à MyPawScribe pour ostéopathe animalier",
  description:
    "Comparez MyPawScribe et Biume: scribe vétérinaire d'un côté; agenda, propriétaires, patients et suivi côté Biume pour thérapeutes animaliers.",
  path: "/alternatives/mypawscribe",
});

export default function MyPawScribeAlternativePage() {
  return (
    <SeoPage
      path="/alternatives/mypawscribe"
      eyebrow="Alternative MyPawScribe"
      title={
        <>
          Alternative MyPawScribe pour les{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            thérapeutes animaliers
          </span>
        </>
      }
      description="MyPawScribe s'adresse plutôt aux comptes rendus vétérinaires et à la documentation clinique. Biume est pensé pour un thérapeute animalier qui veut agenda, propriétaires, patients, résumé propriétaire et suivi post-séance."
      stats={[
        { value: "Vet", label: "MyPawScribe" },
        { value: "Agenda", label: "Biume" },
        { value: "PDF", label: "propriétaire" },
      ]}
      panel={{
        eyebrow: "Comparaison",
        title: "Un scribe vétérinaire n'a pas le même rôle qu'un suivi post-séance.",
        body: "MyPawScribe peut convenir à une logique clinique vétérinaire. Biume reste centré sur les praticiens manuels avec agenda, propriétaires, patients animaux, compréhension propriétaire et continuité du suivi.",
        items: [
          "MyPawScribe: documentation vétérinaire et scribe IA.",
          "Biume: agenda, propriétaires, patients animaux et documents.",
          "Biume: timeline animal, retours et relance J+7/J+30.",
        ],
      }}
      sections={[
        {
          eyebrow: "Quand choisir MyPawScribe",
          title: "Quand vous cherchez un assistant de documentation vétérinaire.",
          body: "MyPawScribe est plus proche des besoins de clinique vétérinaire, de transcription ou de comptes rendus médicaux. Cette logique ne correspond pas toujours aux praticiens manuels indépendants.",
        },
        {
          eyebrow: "Quand choisir Biume",
          title: "Quand votre enjeu est la relation propriétaire après la séance.",
          body: "Biume aide à gérer le rendez-vous, le propriétaire, le patient animal et les documents, puis à expliquer les points observés, transmettre vos conseils et relancer le propriétaire.",
        },
        {
          eyebrow: "Différence",
          title: "Biume évite le vocabulaire de diagnostic IA.",
          body: "Le produit reste dans le cadre du suivi post-séance: résumé propriétaire, confort, mobilité, évolution, points à surveiller et prochaine étape validée par le praticien.",
        },
      ]}
      faq={[
        {
          question: "Biume est-il un scribe vétérinaire ?",
          answer:
            "Non. Biume n'est pas conçu comme un scribe vétérinaire ou un outil de diagnostic. Il aide les thérapeutes animaliers à communiquer après la séance.",
        },
        {
          question: "Pourquoi comparer Biume à MyPawScribe ?",
          answer:
            "Parce que certains praticiens cherchent des outils IA de compte rendu. La comparaison clarifie que Biume cible les thérapeutes animaliers et le suivi propriétaire.",
        },
        {
          question: "Biume rédige-t-il des prescriptions ?",
          answer:
            "Non. Biume aide à structurer les observations et conseils transmis par le praticien. Il ne produit pas d'avis médical autonome.",
        },
      ]}
      internalLinks={[
        { href: "/comparatifs", label: "Tous les comparatifs" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
      ]}
    />
  );
}
