import type { Metadata } from "next";

import { V2Landing } from "../../components/v2/v2-landing";

import "./v2.css";

export const metadata: Metadata = {
  title: "Biume — Votre regard métier, jusqu'au propriétaire",
  description:
    "Dictez vos observations après chaque séance. Biume prépare un compte rendu propriétaire clair et professionnel — vous relisez, vous validez, le propriétaire le reçoit.",
  keywords: [
    "ostéopathe animalier",
    "compte rendu ostéopathie animale",
    "compte rendu propriétaire",
    "logiciel ostéopathe animalier",
    "suivi propriétaire",
  ],
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <V2Landing />;
}
