import { MarketingPage } from "../../components/marketing-page";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment Biume traite les données des praticiens, des propriétaires et des animaux suivis : hébergement en Europe, finalités et durées de conservation.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MarketingPage
      path="/privacy"
      breadcrumbName="Confidentialité"
      eyebrow="Confidentialité"
      title={
        <>
          Politique de{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            confidentialité
          </span>
        </>
      }
      description="Biume traite des données utiles au suivi professionnel : comptes, dossiers patients, rapports et documents partagés. Cette page présente les principes de protection que le service applique."
      badge="RGPD"
      image={{
        src: "/assets/images/dashboard-image.jpg",
        alt: "Interface Biume affichant un tableau de bord de suivi",
      }}
      visualTitle="Données encadrées"
      visualSubtitle="Une approche lisible pour les informations sensibles"
      stats={[
        { value: "100%", label: "conforme RGPD" },
        { value: "FR", label: "hébergement cible" },
        { value: "1", label: "compte contrôlé" },
      ]}
      visualItems={[
        { label: "Finalité", value: "Fournir les rapports, le suivi patient et les fonctions du compte." },
        { label: "Contrôle", value: "Les données restent liées à l'espace professionnel qui les crée." },
        { label: "Sécurité", value: "Les accès et traitements sont limités aux besoins du service." },
      ]}
      sections={[
        {
          eyebrow: "Données",
          title: "Nous collectons uniquement ce qui sert l'usage du produit.",
          body: "Les informations peuvent inclure les données de compte, les informations de cabinet, les dossiers d'animaux, les notes de séance, les rapports générés et les journaux techniques nécessaires au fonctionnement du service.",
        },
        {
          eyebrow: "Usage",
          title: "Les données servent à faire fonctionner Biume.",
          body: "Elles permettent de créer des rapports, retrouver l'historique d'un patient, améliorer l'expérience utilisateur, assurer le support et maintenir la sécurité de la plateforme.",
        },
        {
          eyebrow: "Droits",
          title: "Les demandes de consultation, correction ou suppression sont prises en compte.",
          body: "Un utilisateur peut demander l'accès à ses données, leur rectification ou leur suppression lorsque le cadre légal le permet. Les modalités définitives seront détaillées dans la version juridique complète.",
        },
      ]}
      sidePanel={{
        eyebrow: "Engagement",
        title: "La clarté avant tout.",
        body: "Cette page pose le cadre produit. La version complète de la politique de confidentialité précisera les bases légales, durées de conservation, sous-traitants et contacts dédiés.",
        items: [
          "Limiter les données au besoin réel du service.",
          "Rendre les traitements compréhensibles pour les professionnels.",
          "Protéger les dossiers et documents transmis dans Biume.",
        ],
      }}
    />
  );
}
