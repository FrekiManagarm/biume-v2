import type { Metadata } from "next";
import { siteName, siteUrl } from "./seo";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Logiciel de compte rendu pour ostéopathe animalier | Biume",
    template: `%s | ${siteName}`,
  },
  description:
    "Biume aide les ostéopathes animaliers à structurer leurs observations, préparer des comptes rendus propriétaire clairs et organiser le suivi post-séance.",
  keywords: [
    "ostéopathe animalier",
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
      "Structurez vos observations et préparez un compte rendu propriétaire clair, relu et partagé par vous.",
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
