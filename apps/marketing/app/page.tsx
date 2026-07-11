import { CTASection } from "../components/cta";
import { LandingFaq } from "../components/faq";
import { FeaturesSection } from "../components/features";
import LandingFooter from "../components/footer";
import { Header } from "../components/header";
import { HeroSection } from "../components/hero";
import { PricingSection } from "../components/pricing";
import { JsonLd, siteName, siteUrl } from "../lib/seo";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: siteName,
  url: siteUrl,
  description:
    "Logiciel de compte rendu, suivi post-séance et timeline animal pour ostéopathes animaliers.",
  provider: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  areaServed: "FR",
};

export default function Home() {
  return (
    <div className="landing-theme min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary/25">
      <JsonLd data={serviceSchema} />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <LandingFaq />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
