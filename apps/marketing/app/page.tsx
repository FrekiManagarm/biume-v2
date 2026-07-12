import LandingFooter from "../components/footer";
import { CinematicSceneController } from "../components/landing/cinematic-scene-controller";
import { FinalCta } from "../components/landing/final-cta";
import { LandingFaq } from "../components/landing/landing-faq";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { PricingDecision } from "../components/landing/pricing-decision";
import { ProductProof } from "../components/landing/product-proof";
import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { JsonLd, siteName, siteUrl } from "../lib/seo";

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
    <div className="carnet-theme cinematic-theme min-h-dvh overflow-x-clip bg-[color:var(--carnet-canvas)] text-[color:var(--carnet-ink)] selection:bg-[color:var(--carnet-violet-soft)]">
      <CinematicSceneController />
      <JsonLd data={serviceSchema} />
      <LandingHeader />
      <main id="contenu">
        <LandingHero
          adaptedProposal={REPORT_TRANSFORMATION_DEMO.adaptedProposal}
        />
        <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
        <ProductProof />
        <PricingDecision />
        <section
          id="questions"
          data-landing-section="faq-cta"
          className="px-4 py-10 sm:px-6 md:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[90rem]">
            <LandingFaq />
            <FinalCta />
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
