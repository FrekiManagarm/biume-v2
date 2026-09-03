import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ostéopathe animalier : organiser séances et suivi",
  description:
    "Ressources pour ostéopathe animalier: organiser ses séances, clarifier ses comptes rendus, suivre les propriétaires et valoriser chaque visite.",
  path: "/osteopathe-animalier",
});

export default function OsteopatheAnimalierPage() {
  return (
    <SeoPage
      path="/osteopathe-animalier"
      eyebrow="Ostéopathe animalier"
      title={
        <>
          Ostéopathe animalier: mieux organiser vos séances et{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            rendre le suivi plus clair
          </span>
        </>
      }
      description="Vous exercez comme ostéopathe animalier ou thérapeute manuel de santé animale ? Biume vous aide à structurer les rendez-vous, les comptes rendus, les retours propriétaire et l'évolution de chaque animal."
      stats={[
        { value: "J+7", label: "retour propriétaire" },
        { value: "J+30", label: "prochaine étape" },
        { value: "15 j", label: "essai gratuit" },
      ]}
      panel={{
        eyebrow: "Pratique",
        title: "Un guide pour structurer votre activité de praticien.",
        body: "Quand l'activité se développe, les notes, les retours propriétaire et les prochaines étapes peuvent vite se disperser. Biume aide les professionnels à garder un fil clair entre la séance, l'animal et le suivi après rendez-vous.",
        items: [
          "Organiser le rendez-vous, le propriétaire, le patient animal et les documents.",
          "Transformer les points observés en compte rendu propriétaire lisible.",
          "Garder une timeline animal et préparer les relances utiles.",
        ],
      }}
      sections={[
        {
          eyebrow: "Pratique",
          title: "Le quotidien d'un ostéopathe animalier ne s'arrête pas à la séance.",
          body: "Entre les déplacements, les échanges avec les propriétaires, les notes, les documents et les prochaines étapes, une partie de la valeur se joue après le rendez-vous. Un suivi clair aide le propriétaire à retenir ce qui compte.",
        },
        {
          eyebrow: "Compte rendu",
          title: "Un compte rendu utile doit parler au propriétaire.",
          body: "Le compte rendu d'ostéopathie animale peut garder la précision du praticien tout en restant compréhensible: motif, points observés, conseils transmis, éléments à surveiller et moment pertinent pour reprendre contact.",
        },
        {
          eyebrow: "Suivi",
          title: "Le suivi post-séance rend l'évolution visible.",
          body: "Une timeline animal permet de retrouver les séances précédentes, les retours propriétaire, le confort, la mobilité et les zones suivies. C'est précieux pour les animaux vus régulièrement et pour les propriétaires qui ont besoin de repères.",
        },
        {
          eyebrow: "Outil",
          title: "Biume aide à structurer ce flux sans décider à votre place.",
          body: "Vous gardez la validation finale. Biume organise l'agenda, les propriétaires, les patients animaux, les documents, les comptes rendus et les relances pour que votre suivi reste régulier et professionnel.",
        },
        {
          eyebrow: "Conversion",
          title: "Un suivi mieux compris peut soutenir la fidélisation.",
          body: "Quand le propriétaire comprend ce qui a été observé, quoi surveiller et quand revenir vers vous, la relation gagne en clarté. Biume transforme cette continuité en routine simple après chaque séance.",
        },
      ]}
      faq={[
        {
          question: "Cette page s'adresse-t-elle aux personnes qui cherchent une formation ?",
          answer:
            "Non. Elle s'adresse surtout aux praticiens déjà en activité ou en lancement qui veulent organiser leurs séances, comptes rendus et suivis propriétaire.",
        },
        {
          question: "Biume remplace-t-il l'expertise de l'ostéopathe animalier ?",
          answer:
            "Non. Biume structure et reformule vos observations. Le praticien garde la validation finale avant tout partage au propriétaire.",
        },
        {
          question: "Quel est le lien avec un logiciel ostéopathe animalier ?",
          answer:
            "Biume est le prolongement opérationnel de cette page: un outil pour gérer les rendez-vous, les propriétaires, les patients animaux, les comptes rendus et le suivi post-séance.",
        },
      ]}
      internalLinks={[
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
        { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu ostéopathe animalier" },
        { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
        { href: "/tarifs", label: "Tarifs Biume" },
      ]}
    />
  );
}
