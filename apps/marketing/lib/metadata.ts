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
  // Pas d'`alternates` ici : dans l'App Router, toute page qui n'ecrase pas ce
  // champ herite de la canonique declaree a la racine. Une canonique d'accueil
  // posee globalement desindexe silencieusement les pages qui l'oublient.
  // La canonique de l'accueil est declaree dans app/page.tsx.
  // Ces fichiers vivaient deja dans public/ sans etre references nulle part.
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
