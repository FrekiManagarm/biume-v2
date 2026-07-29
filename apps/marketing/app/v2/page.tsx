import type { Metadata } from "next";

import { LandingV2 } from "../../components/landing-v2";
import "../../components/landing-v2/landing-v2.css";

export const metadata: Metadata = {
  title: "Biume — De vos notes au propriétaire, sans perdre votre regard métier",
  description:
    "Après la séance, écrivez vos notes comme d'habitude. Biume les met en forme pour le propriétaire : vous relisez, vous ajustez, et rien ne part avant votre validation.",
  keywords: [
    "ostéopathe animalier",
    "compte rendu ostéopathie animale",
    "compte rendu propriétaire",
    "logiciel ostéopathe animalier",
    "suivi post-séance",
  ],
  // Route de prévisualisation : elle double la page d'accueil et ne doit
  // pas entrer en concurrence avec elle dans l'index.
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <LandingV2 />;
}
