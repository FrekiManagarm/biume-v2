import LandingFooter from "../components/footer";
import { DailyFlow } from "../components/landing/daily-flow";
import { FinalCta } from "../components/landing/final-cta";
import { FollowUpStory } from "../components/landing/follow-up-story";
import { LandingFaq } from "../components/landing/landing-faq";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { PricingDecision } from "../components/landing/pricing-decision";
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
    <div className="carnet-theme min-h-dvh overflow-x-clip bg-[color:var(--carnet-canvas)] text-[color:var(--carnet-ink)] selection:bg-[color:var(--carnet-violet-soft)]">
      <JsonLd data={serviceSchema} />
      <LandingHeader />
      <main id="contenu">
        <LandingHero />
        <section
          data-landing-section="reassurance"
          aria-labelledby="reassurance-title"
          className="border-y border-[color:var(--carnet-line)] px-4 py-5 sm:px-6 lg:px-8"
        >
          <h2 id="reassurance-title" className="sr-only">
            Une prise en main rassurante
          </h2>
          <ul className="mx-auto grid max-w-[90rem] gap-3 sm:grid-cols-3">
            <li>15 jours pour tout tester</li>
            <li>Sans carte bancaire</li>
            <li>Rien ne part sans votre validation</li>
          </ul>
        </section>
        <DailyFlow />
        <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
        <FollowUpStory />
        <PractitionerControl />
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
