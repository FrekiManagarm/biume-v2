import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Logiciel ostéopathe animalier",
  description:
    "Biume aide les ostéopathes animaliers à envoyer un suivi post-séance clair, une timeline animal et des relances propriétaire validées.",
  path: "/logiciel-osteopathe-animalier",
});

export default function ProductSeoPage() {
  return (
    <SeoPage
      path="/logiciel-osteopathe-animalier"
      eyebrow="Logiciel ostéopathe animalier"
      title={
        <>
          Le logiciel pour transformer chaque séance en{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi propriétaire clair
          </span>
        </>
      }
      description="Biume est un logiciel ostéopathe animalier pensé pour les praticiens manuels de santé animale: résumé de séance, compte rendu propriétaire, timeline animal et relance de suivi, sans remplacer votre expertise."
      stats={[
        { value: "15 j", label: "essai gratuit" },
        { value: "0", label: "carte requise" },
        { value: "J+7", label: "relance de suivi" },
      ]}
      panel={{
        eyebrow: "Positionnement",
        title: "Pas un logiciel de gestion de plus.",
        body: "Animalib, Hunimalis, Stenko ou MyTour couvrent très bien l'administratif. Biume se concentre sur ce qui se passe après la séance: ce que le propriétaire comprend, retient et fait ensuite.",
        items: [
          "Le praticien garde la validation finale de chaque contenu.",
          "Le propriétaire reçoit un résumé court, lisible et rassurant.",
          "La timeline animal garde les points observés et l'évolution.",
        ],
      }}
      sections={[
        {
          eyebrow: "Intent",
          title: "Un logiciel pour les ostéopathes animaliers qui veulent mieux suivre leurs clients.",
          body: "Après une séance, le propriétaire oublie souvent une partie des explications. Biume structure vos points observés, vos conseils transmis par le praticien et la prochaine étape pour rendre le suivi post-séance plus professionnel.",
        },
        {
          eyebrow: "Compte rendu",
          title: "Un résumé propriétaire prêt à relire.",
          body: "Vous saisissez ou dictez vos observations, Biume prépare une version claire pour le propriétaire et vous validez avant envoi. Le compte rendu reste fidèle à votre vocabulaire, mais devient plus facile à comprendre.",
        },
        {
          eyebrow: "Suivi",
          title: "Une timeline animal qui montre l'évolution.",
          body: "Chaque animal conserve ses séances, points observés, zones de confort ou de mobilité, retours propriétaire et relances. Votre mémoire de suivi devient plus structurée entre deux rendez-vous.",
        },
        {
          eyebrow: "Conversion",
          title: "Une relance utile au bon moment.",
          body: "Le suivi J+7 aide à recueillir un retour simple. Le suivi J+30 peut rappeler la prochaine étape lorsque le praticien l'a prévue. L'objectif est d'améliorer la continuité, pas de pousser une vente artificielle.",
        },
      ]}
      faq={[
        {
          question: "Biume remplace-t-il mon logiciel de gestion ?",
          answer:
            "Non. Biume peut vivre à côté de votre agenda, facturation ou logiciel métier. Il cible surtout le compte rendu propriétaire et le suivi post-séance.",
        },
        {
          question: "Est-ce adapté aux praticiens mobiles ?",
          answer:
            "Oui. Les praticiens mobiles peuvent retrouver la timeline animal, préparer un résumé de séance et garder un suivi clair entre les visites.",
        },
        {
          question: "L'IA décide-t-elle à ma place ?",
          answer:
            "Non. Biume aide à structurer et reformuler. Le praticien valide toujours le contenu avant tout partage au propriétaire.",
        },
      ]}
      internalLinks={[
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu ostéopathe animalier" },
        { href: "/tarifs", label: "Tarifs Biume" },
        { href: "/comparatifs", label: "Comparatifs logiciels" },
      ]}
    />
  );
}
