import type { Metadata } from "next";

import { AfterDarkLanding } from "../../components/prototypes/prototype-landings";

export const metadata: Metadata = {
  title: "After dark — prototype de landing",
  description: "Prototype expérimental de la landing Biume.",
  robots: { index: false, follow: false },
};

export default function AfterDarkPage() {
  return <AfterDarkLanding />;
}
