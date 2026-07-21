import { v2FontVariables } from "./fonts";
import { V2Hero } from "./hero";
import { V2Masthead } from "./masthead";
import { V2MotionRoot } from "./reveal";
import {
  V2Close,
  V2Control,
  V2Faq,
  V2Features,
  V2FollowUp,
  V2Footer,
  V2Pricing,
  V2Stats,
} from "./sections";

export function V2Landing() {
  return (
    <V2MotionRoot>
      <div className={`v2 ${v2FontVariables} min-h-screen antialiased`}>
        <V2Masthead />
        <main id="contenu">
          <V2Hero />
          <V2Stats />
          <V2Features />
          <V2Control />
          <V2FollowUp />
          <V2Pricing />
          <V2Faq />
          <V2Close />
        </main>
        <V2Footer />
      </div>
    </V2MotionRoot>
  );
}
