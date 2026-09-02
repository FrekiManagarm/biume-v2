import { MarketingPage } from "../../components/marketing-page";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "À propos",
  description:
    "Biume est né d'une frustration simple : trop de temps passé après les séances. Notre mission, notre approche et ce que nous refusons de faire.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingPage
      path="/about"
      breadcrumbName="À propos"
      eyebrow="À propos de Biume"
      title={
        <>
          Biume aide les thérapeutes animaliers à{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            gagner du temps
          </span>{" "}
          sur leurs rapports.
        </>
      }
      description="Nous construisons un outil calme, précis et utile pour transformer les notes de consultation en rapports clairs, professionnels et faciles à transmettre aux propriétaires."
      badge="mission"
      image={{
        src: "/assets/images/about-mission.jpg",
        alt: "Espace de travail calme dédié au suivi de soins animaliers",
      }}
      visualTitle="Une pratique plus lisible"
      visualSubtitle="Pour les praticiens, les animaux et leurs propriétaires"
      stats={[
        { value: "2 h", label: "économisées par jour" },
        { value: "1", label: "dossier patient clair" },
        { value: "0", label: "copier-coller inutile" },
      ]}
      visualItems={[
        { label: "Origine", value: "Une frustration simple : trop de temps passé après les séances." },
        { label: "Mission", value: "Rendre chaque compte rendu plus rapide, plus clair et plus utile." },
        { label: "Approche", value: "De l'IA encadrée par le regard du praticien, jamais l'inverse." },
      ]}
      sections={[
        {
          eyebrow: "Pourquoi",
          title: "La qualité du soin ne devrait pas se perdre dans l'administratif.",
          body: "Les thérapeutes animaliers jonglent entre l'observation, le suivi, la pédagogie et la relation client. Biume existe pour absorber la partie répétable du travail documentaire sans appauvrir la finesse du diagnostic.",
        },
        {
          eyebrow: "Produit",
          title: "Des rapports qui restent humains.",
          body: "L'application structure les notes, propose des formulations professionnelles et prépare une version compréhensible pour le propriétaire. Le praticien garde toujours la validation finale.",
        },
        {
          eyebrow: "Exigence",
          title: "Un outil conçu pour la confiance.",
          body: "Chaque page, chaque rapport et chaque automatisation doivent servir la clarté : données rangées, vocabulaire précis, interface lisible et respect des informations sensibles.",
        },
      ]}
      sidePanel={{
        eyebrow: "Notre ligne",
        title: "Simple à utiliser, sérieux dans le fond.",
        body: "Biume ne cherche pas à remplacer le praticien. Le produit met en forme, suggère et fait gagner du temps, pendant que l'expertise reste entre vos mains.",
        items: [
          "Réduire la charge mentale après chaque rendez-vous.",
          "Aider les propriétaires à comprendre les soins recommandés.",
          "Conserver un historique exploitable pour chaque animal.",
        ],
      }}
    />
  );
}
