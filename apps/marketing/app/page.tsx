import { CTASection } from "../components/cta";
import { FeaturesSection } from "../components/features";
import LandingFooter from "../components/footer";
import { Header } from "../components/header";
import { HeroSection } from "../components/hero";
import { PricingSection } from "../components/pricing";
import { JsonLd, siteName, siteUrl } from "../lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: siteName,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: siteUrl,
          description:
            "Logiciel de compte rendu, suivi post-séance et timeline animal pour ostéopathes animaliers.",
          offers: {
            "@type": "Offer",
            price: "24.99",
            priceCurrency: "EUR",
          },
          audience: {
            "@type": "Audience",
            audienceType: "Ostéopathes animaliers et thérapeutes animaliers",
          },
        }}
      />
      <Header />
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
        <main>
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <CTASection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
