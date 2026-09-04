import {
  MOBILE_EYEBROW,
  MOBILE_LEAD,
  MOBILE_PERIMETER,
  MOBILE_TITLE,
} from "./content";
import { AppHomeScreen, AppReportScreen } from "./app-mockups";
import { PhoneFrame } from "../frames/phone-frame";
import { Reveal } from "./motion";

export function LandingV5MobileArc() {
  return (
    <section
      id="mobile"
      aria-labelledby="mobile-title"
      className="bg-[color:var(--lv5-surface-muted)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
            {MOBILE_EYEBROW}
          </p>

          <h2
            id="mobile-title"
            className="mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
          >
            {MOBILE_TITLE}
          </h2>

          <p className="mx-auto mt-4 max-w-[54ch] text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
            {MOBILE_LEAD}
          </p>
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] flex flex-col items-center gap-[clamp(32px,4vw,56px)] md:flex-row md:items-center md:justify-center">
          {/*
            Les deux écrans que la phrase au-dessus annonce, dans cet ordre :
            les rendez-vous du jour, puis le compte rendu prêt à envoyer. Les
            deux téléphones restent côte à côte même sur petit écran — empilés,
            ils poussaient les trois cartes hors de vue.
          */}
          <div className="flex shrink-0 items-center justify-center gap-3 sm:gap-5">
            {/*
              L'inclinaison vit sur un div interne, jamais sur le `Reveal` :
              celui-ci est la cible d'un `gsap.set(..., { y })` qui réécrit
              `transform` en entier et effacerait la rotation.
            */}
            <Reveal delay={0} className="w-[38vw] max-w-[196px] sm:w-[196px]">
              <div className="-rotate-2">
                <PhoneFrame>
                  <AppHomeScreen />
                </PhoneFrame>
              </div>
            </Reveal>

            <Reveal delay={120} className="w-[38vw] max-w-[196px] sm:w-[196px]">
              <div className="translate-y-5 rotate-2">
                <PhoneFrame>
                  <AppReportScreen />
                </PhoneFrame>
              </div>
            </Reveal>
          </div>

          <div className="grid w-full max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-[380px] md:grid-cols-1">
            {MOBILE_PERIMETER.map((item, index) => (
              <Reveal key={item.title} delay={200 + index * 80}>
                <article className="h-full rounded-[var(--lv5-radius-card)] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-5">
                  <h3 className="text-[1rem] font-semibold tracking-[-.01em] text-[color:var(--lv5-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
