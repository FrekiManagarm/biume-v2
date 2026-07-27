import "./landing.css";

import { v2FontVariables } from "./fonts";
import { V2Hero } from "./hero";
import { V2Manifesto } from "./manifesto";
import { V2Masthead } from "./masthead";
import { V2MotionRoot } from "./reveal";
import {
  V2Close,
  V2Control,
  V2FieldStories,
  V2Faq,
  V2Features,
  V2FollowUp,
  V2Footer,
  V2Pricing,
} from "./sections";

export function V2Landing() {
  return (
    <V2MotionRoot>
      <div className={`v2 v2-landing ${v2FontVariables} min-h-screen antialiased`}>
        <V2Masthead />
        <main id="contenu" tabIndex={-1}>
          <V2Hero />
          <V2Manifesto />
          <V2Features />
          <V2Control />
          <V2FollowUp />
          <V2FieldStories />
          <V2Pricing />
          <V2Faq />
          <V2Close />
        </main>
        <V2Footer />
      </div>
    </V2MotionRoot>
  );
}
