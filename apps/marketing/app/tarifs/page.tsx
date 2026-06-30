import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tarif logiciel ostéopathe animalier",
  description:
    "Tarif Biume pour ostéopathe animalier: essai 15 jours sans carte, puis 24,99 €/mois annuel ou 29,99 €/mois mensuel pour mieux suivre vos clients.",
  path: "/tarifs",
});

export default function PricingSeoPage() {
  return (
    <SeoPage
      path="/tarifs"
      eyebrow="Tarif logiciel ostéopathe animalier"
      title={
        <>
          Un prix simple pour rendre votre{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi plus professionnel
          </span>
        </>
      }
      description="Biume propose un tarif clair pour les praticiens manuels de santé animale: 15 jours d'essai sans carte, toutes les fonctions incluses, et une valeur mesurée sur le suivi propriétaire."
      stats={[
        { value: "15 jours", label: "essai gratuit" },
        { value: "0", label: "sans carte" },
        { value: "1", label: "rendez-vous repris" },
      ]}
      panel={{
        eyebrow: "Valeur",
        title: "Un seul rendez-vous repris peut rembourser Biume.",
        body: "Biume ne se positionne pas comme une alternative gratuite à la facturation ou au planning. L'outil aide à rendre chaque séance plus mémorable, plus suivie et plus facile à prolonger quand c'est pertinent.",
        items: [
          "24,99 € par mois avec facturation annuelle.",
          "29,99 € par mois en mensuel, annulable.",
          "Essai gratuit de 15 jours, sans carte bancaire.",
        ],
      }}
      sections={[
        {
          eyebrow: "Inclus",
          title: "Toutes les fonctions utiles au suivi post-séance.",
          body: "Le tarif inclut les comptes rendus, résumés propriétaire, PDF personnalisés, dossiers animaux, documents, relances de suivi et support pendant l'essai.",
        },
        {
          eyebrow: "ROI",
          title: "Le prix doit être comparé au suivi récupéré, pas à un outil gratuit.",
          body: "Si une relance claire aide un propriétaire à revenir au bon moment, Biume peut rapidement devenir rentable. L'objectif est de renforcer la relation et la continuité du suivi.",
        },
        {
          eyebrow: "Simplicité",
          title: "Pas de palier complexe au démarrage.",
          body: "Un tarif unique évite les arbitrages inutiles. Vous testez le flux complet avec vos vrais dossiers et vous décidez avant la fin de l'essai.",
        },
      ]}
      faq={[
        {
          question: "Combien coûte Biume ?",
          answer:
            "Biume coûte 24,99 € par mois en annuel ou 29,99 € par mois en mensuel. L'essai dure 15 jours et ne demande pas de carte bancaire.",
        },
        {
          question: "Pourquoi payer si j'ai déjà un outil gratuit ?",
          answer:
            "Les outils gratuits couvrent souvent l'administratif. Biume se concentre sur le compte rendu propriétaire, le suivi post-séance et les relances utiles.",
        },
        {
          question: "Puis-je annuler ?",
          answer:
            "Oui. Le mensuel est annulable à tout moment, et vous pouvez tester Biume avant de payer grâce à l'essai gratuit.",
        },
      ]}
      internalLinks={[
        { href: "/logiciel-osteopathe-animalier", label: "Voir le logiciel" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
        { href: "/comparatifs", label: "Comparer les outils" },
      ]}
      schemaType="Product"
    />
  );
}
