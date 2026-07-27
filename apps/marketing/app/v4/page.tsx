import type { Metadata } from "next";

import { LandingV4 } from "../../components/landing-v4";
import "../../components/landing-v4/landing-v4.css";

export const metadata: Metadata = {
  title:
    "Biume — Vos notes de séance deviennent un compte rendu que le propriétaire comprend",
  description:
    "Écrivez vos notes comme d'habitude. Biume les met en forme pour le propriétaire, vous relisez passage par passage, et rien ne part sans votre validation. 15 jours d'essai, sans carte bancaire.",
  keywords: [
    "ostéopathe animalier",
    "compte rendu ostéopathie animale",
    "compte rendu propriétaire",
    "logiciel ostéopathe animalier",
    "suivi post-séance",
  ],
  // Route de prévisualisation : elle double la page d'accueil et ne
  // doit pas entrer en concurrence avec elle dans l'index.
  robots: { index: false, follow: false },
};

export default function V4Page() {
  return <LandingV4 />;
}
