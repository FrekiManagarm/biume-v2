import { LandingV5 } from "../components/landing-v5";
import { FAQ } from "../components/landing-v5/content";
import { JsonLd, faqJsonLd, siteName, siteUrl } from "../lib/seo";

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

export default function Home() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqJsonLd(FAQ)} />
      <LandingV5 />
    </>
  );
}
