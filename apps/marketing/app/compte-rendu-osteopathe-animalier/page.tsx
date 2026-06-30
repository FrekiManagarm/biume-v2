import type { Metadata } from "next";
import { SeoPage } from "../../components/seo-page";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Compte rendu ostéopathe animalier",
  description:
    "Créez un compte rendu ostéopathe animalier clair: résumé propriétaire, points observés, conseils transmis et relance de suivi.",
  path: "/compte-rendu-osteopathe-animalier",
});

export default function ReportSeoPage() {
  return (
    <SeoPage
      path="/compte-rendu-osteopathe-animalier"
      eyebrow="Compte rendu ostéopathe animalier"
      title={
        <>
          Des comptes rendus que les propriétaires{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            comprennent vraiment
          </span>
        </>
      }
      description="Biume transforme vos observations de séance en compte rendu ostéopathe animalier lisible: version praticien, résumé propriétaire, points à surveiller et relance de suivi validée par vous."
      stats={[
        { value: "1", label: "résumé propriétaire" },
        { value: "PDF", label: "prêt à partager" },
        { value: "J+30", label: "prochaine étape" },
      ]}
      panel={{
        eyebrow: "Après la séance",
        title: "Le soin ne s'arrête pas quand le rendez-vous se termine.",
        body: "Le propriétaire a besoin de comprendre ce qui a été observé, ce qu'il doit surveiller et quand revenir vers vous. Biume rend cette communication plus simple et plus régulière.",
        items: [
          "Résumé de séance court et rassurant.",
          "Points observés, confort, mobilité et évolution.",
          "Conseils transmis par le praticien et prochaine étape.",
        ],
      }}
      sections={[
        {
          eyebrow: "Structure",
          title: "Un compte rendu clair sans repartir d'une page blanche.",
          body: "Biume vous aide à transformer vos notes en sections compréhensibles: contexte, points observés, zones travaillées, conseils transmis, à surveiller et suivi post-séance. Vous gagnez du temps sans perdre votre précision.",
        },
        {
          eyebrow: "Propriétaire",
          title: "Une version pensée pour la personne qui reçoit le rapport.",
          body: "Vos clients ne lisent pas toujours un long compte rendu technique. Biume prépare un résumé propriétaire plus direct, avec un vocabulaire accessible et des repères concrets pour observer l'évolution de l'animal.",
        },
        {
          eyebrow: "Praticien",
          title: "Votre expertise reste au centre.",
          body: "Biume ne formule pas d'avis médical autonome. L'outil met en forme vos observations et vos conseils; vous relisez, corrigez et validez avant tout partage.",
        },
        {
          eyebrow: "Fidélisation",
          title: "La relance de suivi devient une habitude professionnelle.",
          body: "Un message J+7 ou J+30 peut demander un retour, rappeler ce qui était à surveiller ou préparer la prochaine étape. Le suivi devient plus visible et plus utile pour le propriétaire.",
        },
      ]}
      faq={[
        {
          question: "Puis-je garder mon modèle de compte rendu ?",
          answer:
            "Oui. Biume vise à structurer votre méthode, pas à imposer un style unique. Vous gardez le vocabulaire et les formulations importantes.",
        },
        {
          question: "Le compte rendu est-il destiné au propriétaire ?",
          answer:
            "Oui, Biume met l'accent sur une version propriétaire claire, avec des points observés, des conseils transmis et une prochaine étape compréhensible.",
        },
        {
          question: "Puis-je utiliser Biume pour chien, chat et cheval ?",
          answer:
            "Oui. Le suivi par animal permet de conserver l'historique et l'évolution, quel que soit le type de patient accompagné.",
        },
      ]}
      internalLinks={[
        { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
        { href: "/tarifs", label: "Prix de Biume" },
        { href: "/comparatifs", label: "Voir les alternatives" },
      ]}
    />
  );
}
