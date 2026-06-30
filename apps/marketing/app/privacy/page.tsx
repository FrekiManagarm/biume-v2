import { MarketingPage } from "../../components/marketing-page";

export default function PrivacyPage() {
  return (
    <MarketingPage
      eyebrow="Confidentialite"
      title={
        <>
          Politique de{" "}
          <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            confidentialite
          </span>
        </>
      }
      description="Biume traite des donnees utiles au suivi professionnel: comptes, dossiers patients, rapports et documents partages. Cette page presente les principes de protection que le service applique."
      badge="RGPD"
      image={{
        src: "/assets/images/dashboard-image.jpg",
        alt: "Interface Biume affichant un tableau de bord de suivi",
      }}
      visualTitle="Donnees encadrees"
      visualSubtitle="Une approche lisible pour les informations sensibles"
      stats={[
        { value: "100%", label: "conforme RGPD" },
        { value: "FR", label: "hebergement cible" },
        { value: "1", label: "compte controle" },
      ]}
      visualItems={[
        { label: "Finalite", value: "Fournir les rapports, le suivi patient et les fonctions du compte." },
        { label: "Controle", value: "Les donnees restent liees a l'espace professionnel qui les cree." },
        { label: "Securite", value: "Les acces et traitements sont limites aux besoins du service." },
      ]}
      sections={[
        {
          eyebrow: "Donnees",
          title: "Nous collectons uniquement ce qui sert l'usage du produit.",
          body: "Les informations peuvent inclure les donnees de compte, les informations de cabinet, les dossiers d'animaux, les notes de seance, les rapports generes et les journaux techniques necessaires au fonctionnement du service.",
        },
        {
          eyebrow: "Usage",
          title: "Les donnees servent a faire fonctionner Biume.",
          body: "Elles permettent de creer des rapports, retrouver l'historique d'un patient, ameliorer l'experience utilisateur, assurer le support et maintenir la securite de la plateforme.",
        },
        {
          eyebrow: "Droits",
          title: "Les demandes de consultation, correction ou suppression sont prises en compte.",
          body: "Un utilisateur peut demander l'acces a ses donnees, leur rectification ou leur suppression lorsque le cadre legal le permet. Les modalites definitives seront detaillees dans la version juridique complete.",
        },
      ]}
      sidePanel={{
        eyebrow: "Engagement",
        title: "La clarte avant tout.",
        body: "Cette page pose le cadre produit. La version complete de la politique de confidentialite precisera les bases legales, durees de conservation, sous-traitants et contacts dedies.",
        items: [
          "Limiter les donnees au besoin reel du service.",
          "Rendre les traitements comprehensibles pour les professionnels.",
          "Proteger les dossiers et documents transmis dans Biume.",
        ],
      }}
    />
  );
}
