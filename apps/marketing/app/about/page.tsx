import { MarketingPage } from "../../components/marketing-page";

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="A propos de Biume"
      title={
        <>
          Biume aide les therapeutes animaliers a{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            gagner du temps
          </span>{" "}
          sur leurs rapports.
        </>
      }
      description="Nous construisons un outil calme, precis et utile pour transformer les notes de consultation en rapports clairs, professionnels et faciles a transmettre aux proprietaires."
      badge="mission"
      image={{
        src: "/assets/images/about-mission.jpg",
        alt: "Espace de travail calme dedie au suivi de soins animaliers",
      }}
      visualTitle="Une pratique plus lisible"
      visualSubtitle="Pour les praticiens, les animaux et leurs proprietaires"
      stats={[
        { value: "2 h", label: "economisees par jour" },
        { value: "1", label: "dossier patient clair" },
        { value: "0", label: "copier-coller inutile" },
      ]}
      visualItems={[
        { label: "Origine", value: "Une frustration simple: trop de temps passe apres les seances." },
        { label: "Mission", value: "Rendre chaque compte rendu plus rapide, plus clair et plus utile." },
        { label: "Approche", value: "De l'IA encadree par le regard du praticien, jamais l'inverse." },
      ]}
      sections={[
        {
          eyebrow: "Pourquoi",
          title: "La qualite du soin ne devrait pas se perdre dans l'administratif.",
          body: "Les therapeutes animaliers jonglent entre l'observation, le suivi, la pedagogie et la relation client. Biume existe pour absorber la partie repetable du travail documentaire sans appauvrir la finesse du diagnostic.",
        },
        {
          eyebrow: "Produit",
          title: "Des rapports qui restent humains.",
          body: "L'application structure les notes, propose des formulations professionnelles et prepare une version comprehensible pour le proprietaire. Le praticien garde toujours la validation finale.",
        },
        {
          eyebrow: "Exigence",
          title: "Un outil concu pour la confiance.",
          body: "Chaque page, chaque rapport et chaque automatisation doivent servir la clarte: donnees rangees, vocabulaire precis, interface lisible et respect des informations sensibles.",
        },
      ]}
      sidePanel={{
        eyebrow: "Notre ligne",
        title: "Simple a utiliser, serieux dans le fond.",
        body: "Biume ne cherche pas a remplacer le praticien. Le produit met en forme, suggere et fait gagner du temps, pendant que l'expertise reste entre vos mains.",
        items: [
          "Reduire la charge mentale apres chaque rendez-vous.",
          "Aider les proprietaires a comprendre les soins recommandes.",
          "Conserver un historique exploitable pour chaque animal.",
        ],
      }}
    />
  );
}
