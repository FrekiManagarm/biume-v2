import { MarketingPage } from "../../components/marketing-page";

export default function TermsPage() {
  return (
    <MarketingPage
      eyebrow="Conditions"
      title={
        <>
          Conditions generales{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            d&apos;utilisation
          </span>
        </>
      }
      description="Les CGU cadrent l'utilisation de Biume: creation de compte, usage professionnel, responsabilites et limites du service. Cette version presente les grands principes avant publication des conditions completes."
      badge="cadre"
      image={{
        src: "/assets/images/pro-landing.jpg",
        alt: "Professionnel utilisant Biume pour preparer un rapport",
      }}
      visualTitle="Un cadre simple"
      visualSubtitle="Pour utiliser Biume avec les bons reperes"
      stats={[
        { value: "15 j", label: "essai gratuit" },
        { value: "1", label: "compte professionnel" },
        { value: "PDF", label: "rapports exportes" },
      ]}
      visualItems={[
        { label: "Acces", value: "Le compte donne acces aux outils de redaction et de suivi." },
        { label: "Usage", value: "Biume accompagne le travail documentaire du professionnel." },
        { label: "Limite", value: "Les decisions de soin restent sous la responsabilite du praticien." },
      ]}
      sections={[
        {
          eyebrow: "Compte",
          title: "Chaque utilisateur gere son espace professionnel.",
          body: "L'acces a Biume repose sur un compte personnel ou professionnel. L'utilisateur est responsable des informations renseignees, de la confidentialite de ses acces et de l'usage effectue depuis son espace.",
        },
        {
          eyebrow: "Service",
          title: "Biume assiste la redaction, sans remplacer l'expertise.",
          body: "Les suggestions, reformulations et generations de rapports servent de support de travail. Elles doivent etre relues, ajustees et validees par le professionnel avant tout partage.",
        },
        {
          eyebrow: "Documents",
          title: "Les contenus generes doivent rester exacts et loyaux.",
          body: "Les rapports, notes et documents exportes depuis Biume doivent correspondre aux observations du praticien. L'utilisateur reste responsable de leur diffusion et de leur conservation hors plateforme.",
        },
      ]}
      sidePanel={{
        eyebrow: "A retenir",
        title: "Un outil de productivite, pas une autorite medicale.",
        body: "Les conditions completes preciseront les abonnements, disponibilites, limitations, responsabilites et modalites de resiliation.",
        items: [
          "Verifier chaque rapport avant de le transmettre.",
          "Utiliser Biume dans un cadre professionnel legitime.",
          "Respecter les donnees des clients et des animaux suivis.",
        ],
      }}
    />
  );
}
