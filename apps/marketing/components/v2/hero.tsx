import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { webAppPath } from "../../lib/web-app-url";
import { HeroItem, HeroReveal, Reveal } from "./reveal";
import { TransformationArtifact } from "./transformation-artifact";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const proofPoints = [
  "Relecture passage par passage",
  "Aucun envoi sans votre validation",
  "Export PDF professionnel",
] as const;

function ProofCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 text-[color:var(--v2-accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export function V2Hero() {
  return (
    <section aria-labelledby="v2-hero-title" className="relative overflow-hidden">
      {/* Halo discret, unique touche atmosphérique de la page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(52% 60% at 50% 0%, rgba(107, 90, 200, 0.07) 0%, rgba(107, 90, 200, 0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <HeroReveal className="mx-auto max-w-3xl text-center">
          <HeroItem>
            <p className="v2-eyebrow">
              Pour les ostéopathes animaliers indépendants
            </p>
          </HeroItem>
          <HeroItem>
            <h1
              id="v2-hero-title"
              className="v2-display mt-5 text-balance text-[clamp(2.5rem,5.4vw,4.3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[color:var(--v2-ink)]"
            >
              Le compte rendu propriétaire, prêt avant de quitter l'écurie.
            </h1>
          </HeroItem>
          <HeroItem>
            <p className="mx-auto mt-6 max-w-[58ch] text-pretty text-[1.05rem] leading-7 text-[color:var(--v2-ink-soft)]">
              Dictez vos observations après chaque séance. Biume prépare un
              compte rendu clair et professionnel. Vous relisez, vous validez,
              le propriétaire le reçoit.
            </p>
          </HeroItem>
          <HeroItem>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={webAppPath("/signup")}
                data-conversion="hero-signup"
                className="v2-btn v2-btn-primary w-full sm:w-auto"
              >
                Commencer gratuitement
              </a>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="hero-demo"
                className="v2-btn v2-btn-secondary w-full sm:w-auto"
              >
                Demander une démo
              </a>
            </div>
            <p className="v2-mono mt-5 text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
              15 jours d'essai · Sans carte bancaire
            </p>
          </HeroItem>
        </HeroReveal>

        <Reveal delay={0.2} className="mt-16 md:mt-20">
          <div className="v2-panel mx-auto max-w-5xl p-5 md:p-9">
            <TransformationArtifact
              note={REPORT_TRANSFORMATION_DEMO.note}
              sections={REPORT_TRANSFORMATION_DEMO.sections}
              ownerSummary={REPORT_TRANSFORMATION_DEMO.ownerSummary}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 text-[0.85rem] font-medium text-[color:var(--v2-ink-soft)]"
              >
                <ProofCheck />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
