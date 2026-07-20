import { v2FontVariables } from "./fonts";
import { V2Hero } from "./hero";
import { V2Masthead } from "./masthead";
import { V2MotionRoot } from "./reveal";
import {
  V2Close,
  V2Faq,
  V2Footer,
  V2Pricing,
} from "./sections-conversion";
import {
  V2Control,
  V2Field,
  V2FollowUp,
  V2Transformation,
} from "./sections-story";

export function V2Landing() {
  return (
    <V2MotionRoot>
      <div className={`v2 ${v2FontVariables} min-h-[100dvh] antialiased`}>
        <V2Masthead />
        <main id="contenu">
          <V2Hero />
          <V2Transformation />
          <V2Control />
          <V2FollowUp />
          <V2Field />
          <V2Pricing />
          <V2Faq />
          <V2Close />
        </main>
        <V2Footer />
      </div>
    </V2MotionRoot>
  );
}
