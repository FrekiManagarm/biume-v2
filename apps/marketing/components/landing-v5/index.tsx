import "./landing-v5.css";

import { LandingV5Atelier } from "./atelier";
import { LandingV5Bento } from "./bento";
import { LandingV5Boundaries } from "./boundaries";
import { LandingV5Close } from "./close";
import { LandingV5Facts } from "./facts";
import { LandingV5Faq } from "./faq";
import { fontVariables } from "./fonts";
import { LandingV5Features } from "./features";
import { LandingV5FollowUp } from "./follow-up";
import { LandingV5Footer } from "./footer";
import { LandingV5Hero } from "./hero";
import { LandingV5Masthead } from "./masthead";
import { LandingV5MobileArc } from "./mobile-arc";
import { LandingV5MotionRoot } from "./motion";
import { LandingV5Owner } from "./owner";
import { LandingV5Pricing } from "./pricing";
import { LandingV5ReportTabs } from "./report-tabs";
import { LandingV5TradesMarquee } from "./trades-marquee";

export function LandingV5() {
  return (
    <LandingV5MotionRoot>
      <div className={`landing-v5 ${fontVariables} min-h-screen antialiased`}>
        <LandingV5Masthead />
        <main id="contenu" tabIndex={-1}>
          <LandingV5Hero />
          <LandingV5TradesMarquee />
          <LandingV5Facts />
          <LandingV5Bento />
          <LandingV5ReportTabs />
          <LandingV5Atelier />
          <LandingV5Features />
          <LandingV5MobileArc />
          <LandingV5Owner />
          <LandingV5FollowUp />
          <LandingV5Boundaries />
          <LandingV5Pricing />
          <LandingV5Faq />
          <LandingV5Close />
        </main>
        <LandingV5Footer />
      </div>
    </LandingV5MotionRoot>
  );
}
