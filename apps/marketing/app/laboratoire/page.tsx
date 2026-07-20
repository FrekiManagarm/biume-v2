import type { Metadata } from "next";

import { LaboratoireLanding } from "../../components/prototypes/prototype-landings";

export const metadata: Metadata = {
  title: "Laboratoire — prototype de landing",
  description: "Prototype expérimental de la landing Biume.",
  robots: { index: false, follow: false },
};

export default function LaboratoirePage() {
  return <LaboratoireLanding />;
}
