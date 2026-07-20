import LandingFooter from "../components/footer";
import { FieldStories } from "../components/landing/field-stories";
import { FollowUpContinuity } from "../components/landing/follow-up-continuity";
import { LandingClose } from "../components/landing/landing-close";
import { LandingFaq } from "../components/landing/landing-faq";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { LandingShell } from "../components/landing/landing-shell";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { PricingManifest } from "../components/landing/pricing-manifest";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { TransformationWorkshop } from "../components/landing/transformation-workshop";
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-[color:var(--atelier-violet)] focus:px-4 focus:text-sm focus:font-semibold focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
      >
        Aller au contenu
      </a>
      <LandingHeader />
      <main id="contenu" tabIndex={-1}>
        <LandingHero />
        <TransformationWorkshop demo={REPORT_TRANSFORMATION_DEMO} />
        <PractitionerControl />
        <FollowUpContinuity />
        <FieldStories />
        <PricingManifest />
        <section
          data-landing-section="faq-cta"
          className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <LandingFaq />
            <LandingClose />
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingShell>
  );
}
