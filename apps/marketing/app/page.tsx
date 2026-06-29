import { CTASection } from "../components/cta";
import { FeaturesSection } from "../components/features";
import LandingFooter from "../components/footer";
import { Header } from "../components/header";
import { HeroSection } from "../components/hero";
import { PricingSection } from "../components/pricing";

export default function Home() {
  return (
    <>
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
