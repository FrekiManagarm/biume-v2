import type { Metadata } from "next";

import { V3Landing } from "../../components/v3/v3-landing";

import "./v3.css";

export const metadata: Metadata = {
  title: "Biume — De vos notes au propriétaire",
  description:
    "Une variante de landing Biume : des observations de séance, une préparation claire, puis votre validation.",
  robots: { index: false, follow: false },
};

export default function V3Page() {
  return <V3Landing />;
}
