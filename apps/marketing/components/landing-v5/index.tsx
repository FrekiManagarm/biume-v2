import "./landing-v5.css";

import { LandingV5Around } from "./around";
import { LandingV5Boundaries } from "./boundaries";
import { LandingV5Close } from "./close";
import { LandingV5Control } from "./control";
import { OWNER_PLATE, PRACTICE_PLATE } from "./content";
import { LandingV5Facts } from "./facts";
import { LandingV5Faq } from "./faq";
import { landingV5FontVariables } from "./fonts";
import { LandingV5FollowUp } from "./follow-up";
import { LandingV5Footer } from "./footer";
import { LandingV5Hero } from "./hero";
import { LandingV5Masthead } from "./masthead";
import { LandingV5MotionRoot } from "./motion";
import { LandingV5Owner } from "./owner";
import { PhotoPlate } from "./photo-plate";
import { LandingV5Pricing } from "./pricing";
import { LandingV5Specimen } from "./specimen";
import { LandingV5Surfaces } from "./surfaces";

export function LandingV5() {
  return (
    <LandingV5MotionRoot>
      <div className={`landing-v5 ${landingV5FontVariables} min-h-screen antialiased`}>
        <LandingV5Masthead />
        <main id="contenu" tabIndex={-1}>
          <LandingV5Hero />
          <LandingV5Facts />
          <LandingV5Specimen />
          <PhotoPlate
            ariaLabel="Le geste"
            tone="dark"
            heightClass="min-h-[min(74svh,620px)]"
            {...PRACTICE_PLATE}
          />
          <LandingV5Control />
          <PhotoPlate
            ariaLabel="Le propriétaire"
            tone="light"
            heightClass="min-h-[min(70svh,580px)]"
            {...OWNER_PLATE}
          />
          <LandingV5FollowUp />
          <LandingV5Owner />
          <LandingV5Surfaces />
          <LandingV5Around />
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
