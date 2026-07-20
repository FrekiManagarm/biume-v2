import type { Metadata } from "next";

import { V2Landing } from "../../components/v2/v2-landing";

import "./v2.css";

export const metadata: Metadata = {
  title: "Biume — Votre regard métier, jusqu'au propriétaire",
  description:
    "Prototype éditorial de la landing Biume : de vos notes de séance au compte rendu propriétaire, sans perdre votre regard métier.",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <V2Landing />;
}
