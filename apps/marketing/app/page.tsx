import LandingFooter from "../components/footer";
import { FinalCta } from "../components/landing/final-cta";
import { LandingFaq } from "../components/landing/landing-faq";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { LandingShell } from "../components/landing/landing-shell";
import { FollowUpFlow } from "../components/landing/follow-up-flow";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { PricingDecision } from "../components/landing/pricing-decision";
import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { UseMoments } from "../components/landing/use-moments";
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
    <LandingShell>
      <JsonLd data={serviceSchema} />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-[color:var(--machine-violet)] focus:px-4 focus:text-sm focus:font-semibold focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
      >
        Aller au contenu
      </a>
      <LandingHeader />
      <main id="contenu" tabIndex={-1}>
        <LandingHero />
        <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
        <PractitionerControl />
        <FollowUpFlow />
        <UseMoments />
        <PricingDecision />
        <section
          id="questions"
          data-landing-section="faq-cta"
          className="px-4 py-16 sm:px-6 md:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-[90rem]">
            <LandingFaq />
            <FinalCta />
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingShell>
  );
}
