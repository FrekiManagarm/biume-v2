import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Logiciel pour ostéopathe animalier",
  description:
    "Biume aide chaque ostéopathe animalier à organiser ses séances, comptes rendus, propriétaires, patients et suivis post-séance.",
  path: "/logiciel-osteopathe-animalier",
});

export default function ProductSeoPage() {
  return (
    <SeoPage
      path="/logiciel-osteopathe-animalier"
      eyebrow="Logiciel ostéopathe animalier"
      title={
        <>
          Le logiciel pour les ostéopathes animaliers qui veulent transformer chaque séance en{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            suivi propriétaire clair
          </span>
        </>
      }
      description="Biume est un logiciel pour ostéopathe animalier pensé pour les praticiens manuels de santé animale: agenda, propriétaires, patients animaux, compte rendu, timeline animal et relance de suivi, sans remplacer votre expertise."
      stats={[
        { value: "15 j", label: "essai gratuit" },
        { value: "0", label: "carte requise" },
        { value: "J+7", label: "relance de suivi" },
      ]}
      panel={{
        eyebrow: "Positionnement",
        title: "Un socle métier, avec un vrai suivi après la séance.",
        body: "Biume couvre les besoins quotidiens du praticien: agenda, propriétaires, patients, documents et comptes rendus. Sa différence est de relier cette gestion à ce qui se passe après la séance: ce que le propriétaire comprend, retient et fait ensuite.",
        items: [
          "L'agenda garde vos rendez-vous et le contexte de suivi.",
          "Les propriétaires, patients et documents restent reliés à chaque animal.",
          "Le praticien garde la validation finale de chaque contenu.",
        ],
      }}
      sections={[
        {
          eyebrow: "Intent",
          title: "Un logiciel pour votre pratique, pas pour découvrir le métier.",
          body: "Biume s'adresse aux ostéopathes animaliers qui veulent organiser leurs séances, garder leurs dossiers à jour et mieux faire comprendre le suivi au propriétaire après chaque rendez-vous.",
        },
        {
          eyebrow: "Gestion",
          title: "Agenda, propriétaires et patients dans le même flux.",
          body: "Vous gardez vos rendez-vous, vos propriétaires, vos patients animaux et les documents utiles au même endroit. Le suivi post-séance ne vit pas à côté de la gestion: il s'appuie sur elle.",
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
          question: "Biume inclut-il un agenda et une gestion propriétaires/patients ?",
          answer:
            "Oui. Biume inclut une partie agenda, une gestion des propriétaires, des patients animaux et des documents. Sa différence est de relier ce socle au compte rendu et au suivi post-séance.",
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
        { href: "/osteopathe-animalier", label: "Guide ostéopathe animalier" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu ostéopathe animalier" },
        { href: "/tarifs", label: "Tarifs Biume" },
        { href: "/comparatifs", label: "Comparatifs logiciels" },
      ]}
    />
  );
}
