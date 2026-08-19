import {
  MOBILE_EYEBROW,
  MOBILE_LEAD,
  MOBILE_PERIMETER,
  MOBILE_SCREENS,
  MOBILE_TITLE,
} from "./content";
import { PhoneFrame } from "../frames/phone-frame";
import { Reveal } from "./motion";

/**
 * Rotation, translation verticale et largeur par index (0 à 4). Calculées
 * en style inline car elles dépendent de l'index — pas de classes
 * Tailwind statiques possibles ici.
 */
const ARC_ROTATION = [-8, -4, 0, 4, 8] as const;
const ARC_TRANSLATE_Y = [18, 6, 0, 6, 18] as const;
const ARC_WIDTH = [200, 216, 244, 216, 200] as const;

/**
 * Visibilité responsive : Tailwind pur, aucun JS. Les deux téléphones
 * extérieurs (index 0, 4) n'apparaissent qu'à partir de 900px, les deux
 * intermédiaires (index 1, 3) à partir de 700px. Le central (index 2) est
 * toujours visible.
 */
const ARC_VISIBILITY = [
  "hidden min-[900px]:block",
  "hidden min-[700px]:block",
  "",
  "hidden min-[700px]:block",
  "hidden min-[900px]:block",
] as const;

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

        <div className="mt-[clamp(40px,5vw,64px)] flex items-end justify-center">
          {MOBILE_SCREENS.map((screen, index) => (
            <div
              key={screen.label}
              className={ARC_VISIBILITY[index]}
              style={{
                width: `${ARC_WIDTH[index]}px`,
                transform: `rotate(${ARC_ROTATION[index]}deg) translateY(${ARC_TRANSLATE_Y[index]}px)`,
                zIndex: index === 2 ? 2 : 1,
                marginLeft: index === 0 ? 0 : "-32px",
                position: "relative",
              }}
            >
              <PhoneFrame>
                <div
                  aria-hidden="true"
                  className="flex h-full items-center justify-center p-4 text-center text-[0.9rem] font-semibold leading-[1.3] text-[color:var(--lv5-ink)]"
                >
                  {screen.label}
                </div>
              </PhoneFrame>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(32px,4vw,48px)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOBILE_PERIMETER.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
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
    </section>
  );
}
