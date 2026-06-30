import type { Metadata } from "next";
import { siteName, siteUrl } from "./seo";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Logiciel de compte rendu pour ostéopathe animalier | Biume",
    template: `%s | ${siteName}`,
  },
  description:
    "Biume aide les ostéopathes animaliers à créer un suivi post-séance clair, des comptes rendus propriétaire et une timeline animal.",
  keywords: [
    "logiciel ostéopathe animalier",
    "compte rendu ostéopathe animalier",
    "suivi post-séance animal",
    "logiciel thérapeute animalier",
    "résumé propriétaire animal",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Logiciel de compte rendu pour ostéopathe animalier | Biume",
    description:
      "Créez des résumés propriétaire, une timeline animal et des relances de suivi validées par le praticien.",
    url: siteUrl,
    siteName,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logiciel de compte rendu pour ostéopathe animalier | Biume",
    description:
      "Transformez chaque séance en suivi propriétaire clair et professionnel.",
  },
};
