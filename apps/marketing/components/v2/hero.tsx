import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { webAppPath } from "../../lib/web-app-url";
import { Magnetic } from "./magnetic";
import { HeroItem, HeroReveal, Reveal } from "./reveal";
import { TransformationArtifact } from "./transformation-artifact";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const PROOFS = [
  "Relecture passage par passage",
  "Aucun envoi sans votre validation",
  "Export PDF professionnel",
] as const;

function ProofItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-[color:var(--v2-ink-soft)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-3 w-3 shrink-0 text-[color:var(--v2-accent)]"
      >
        <path
          d="M2 6.5 4.6 9 10 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </li>
  );
}

export function V2Hero() {
  return (
    <section aria-labelledby="v2-hero-title" className="relative overflow-hidden">
      {/* Halo vert discret en haut de page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{
          background:
            "radial-gradient(52% 44% at 70% 10%, hsl(251 73% 72% / 0.20) 0%, hsl(251 73% 72% / 0.07) 45%, rgba(250,250,250,0) 75%), radial-gradient(34% 30% at 12% 30%, hsl(148 71% 45% / 0.10) 0%, rgba(250,250,250,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <HeroReveal>
            <HeroItem>
              <p className="v2-eyebrow flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="v2-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--v2-accent)]"
                />
                Pour les ostéopathes animaliers indépendants
              </p>
            </HeroItem>
            <HeroItem className="mt-6">
              <h1
                id="v2-hero-title"
                className="v2-display max-w-[12ch] text-[clamp(2.7rem,5.6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[color:var(--v2-ink)] [text-wrap:balance]"
              >
                Le compte rendu propriétaire, prêt avant de quitter l'écurie.
              </h1>
            </HeroItem>
            <HeroItem className="mt-6">
              <p className="max-w-[46ch] text-[1.05rem] leading-[1.65] text-[color:var(--v2-ink-soft)] [text-wrap:pretty]">
                Dictez vos observations après chaque séance. Biume prépare un
                compte rendu clair et professionnel — vous relisez, vous
                validez, le propriétaire le reçoit.
              </p>
            </HeroItem>
            <HeroItem className="mt-9">
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <a
                    href={webAppPath("/inscription")}
                    className="v2-btn v2-btn-primary"
                  >
                    Commencer gratuitement
                  </a>
                </Magnetic>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="v2-btn v2-btn-secondary"
                >
                  Demander une démo
                </a>
              </div>
              <p className="mt-4 text-[0.82rem] text-[color:var(--v2-ink-faint)]">
                15 jours d'essai · Sans carte bancaire
              </p>
            </HeroItem>
          </HeroReveal>

          {/* Preuve produit : panneau décalé sur dalle verte */}
          <Reveal delay={0.25} className="relative lg:mt-10">
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 bottom-8 left-8 rounded-[2.5rem] bg-[color:var(--v2-accent-soft)] md:-right-6 md:-top-6"
            />
            <div className="v2-panel relative p-5 md:p-7">
              <TransformationArtifact
                note={REPORT_TRANSFORMATION_DEMO.note}
                sections={REPORT_TRANSFORMATION_DEMO.sections}
                ownerSummary={REPORT_TRANSFORMATION_DEMO.ownerSummary}
              />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <ul className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-[color:var(--v2-line)] pt-7 md:mt-20">
            {PROOFS.map((label) => (
              <ProofItem key={label} label={label} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
