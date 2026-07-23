import type { Metadata } from "next";

import { V4Landing } from "../../components/v4/v4-landing";

import "./v4.css";

export const metadata: Metadata = {
  title: "Biume — Préparez, relisez, décidez",
  description:
    "Biume aide les ostéopathes animaliers à préparer, relire et décider de leurs comptes rendus de séance avant de les partager.",
  robots: { index: false, follow: false },
};

export default function V4Page() {
  return <V4Landing />;
}
