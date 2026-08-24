import { MarketingPage } from "../../components/marketing-page";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Conditions générales d'utilisation",
  description:
    "Les CGU de Biume : création de compte, usage professionnel, responsabilités du praticien et limites du service de rédaction assistée.",
  path: "/cgu",
});

export default function TermsPage() {
  return (
    <MarketingPage
      path="/cgu"
      breadcrumbName="Conditions générales d'utilisation"
      eyebrow="Conditions"
      title={
        <>
          Conditions générales{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            d&apos;utilisation
          </span>
        </>
      }
      description="Les CGU cadrent l'utilisation de Biume : création de compte, usage professionnel, responsabilités et limites du service. Cette version présente les grands principes avant publication des conditions complètes."
      badge="cadre"
      image={{
        src: "/assets/images/pro-landing.jpg",
        alt: "Professionnel utilisant Biume pour préparer un rapport",
      }}
      visualTitle="Un cadre simple"
      visualSubtitle="Pour utiliser Biume avec les bons repères"
      stats={[
        { value: "15 j", label: "essai gratuit" },
        { value: "1", label: "compte professionnel" },
        { value: "PDF", label: "rapports exportés" },
      ]}
      visualItems={[
        { label: "Accès", value: "Le compte donne accès aux outils de rédaction et de suivi." },
        { label: "Usage", value: "Biume accompagne le travail documentaire du professionnel." },
        { label: "Limite", value: "Les décisions de soin restent sous la responsabilité du praticien." },
      ]}
      sections={[
        {
          eyebrow: "Compte",
          title: "Chaque utilisateur gère son espace professionnel.",
          body: "L'accès à Biume repose sur un compte personnel ou professionnel. L'utilisateur est responsable des informations renseignées, de la confidentialité de ses accès et de l'usage effectué depuis son espace.",
        },
        {
          eyebrow: "Service",
          title: "Biume assiste la rédaction, sans remplacer l'expertise.",
          body: "Les suggestions, reformulations et générations de rapports servent de support de travail. Elles doivent être relues, ajustées et validées par le professionnel avant tout partage.",
        },
        {
          eyebrow: "Documents",
          title: "Les contenus générés doivent rester exacts et loyaux.",
          body: "Les rapports, notes et documents exportés depuis Biume doivent correspondre aux observations du praticien. L'utilisateur reste responsable de leur diffusion et de leur conservation hors plateforme.",
        },
      ]}
      sidePanel={{
        eyebrow: "À retenir",
        title: "Un outil de productivité, pas une autorité médicale.",
        body: "Les conditions complètes préciseront les abonnements, disponibilités, limitations, responsabilités et modalités de résiliation.",
        items: [
          "Vérifier chaque rapport avant de le transmettre.",
          "Utiliser Biume dans un cadre professionnel légitime.",
          "Respecter les données des clients et des animaux suivis.",
        ],
      }}
    />
  );
}
