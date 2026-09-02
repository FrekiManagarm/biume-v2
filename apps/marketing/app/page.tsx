import type { Metadata } from "next";

import { LandingV5 } from "../components/landing-v5";
import { FAQ } from "../components/landing-v5/content";
import { JsonLd, faqJsonLd, siteName, siteUrl } from "../lib/seo";

// La canonique de l'accueil vit ici et non dans rootMetadata : posee a la
// racine, elle etait heritee par toute page sans metadata propre.
export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: siteName,
  url: siteUrl,
  description:
    "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
  provider: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  areaServed: "FR",
};

// L'Organization n'existait que comme `provider` imbrique. Declaree a la racine
// avec son logo, elle devient l'entite de marque que Google peut rattacher au
// nom "Biume". Pas de `sameAs` : aucun profil social n'existe a ce jour, et en
// inventer casserait la validation du balisage.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/brand/biume-logo.png`,
  description:
    "Biume prépare le compte rendu propriétaire et le suivi post-séance des ostéopathes animaliers.",
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqJsonLd(FAQ)} />
      <LandingV5 />
    </>
  );
}
