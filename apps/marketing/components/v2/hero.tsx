import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { HeroItem, HeroLine, HeroReveal } from "./reveal";
import { TransformationArtifact } from "./transformation-artifact";

export function V2Hero() {
  return (
    <section className="relative overflow-hidden">
      <span
        aria-hidden="true"
        className="v2-display pointer-events-none absolute -left-10 top-16 hidden select-none text-[21rem] leading-none text-transparent lg:block"
        style={{ WebkitTextStroke: "1px var(--v2-line)" }}
      >
        01
      </span>

      <HeroReveal className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-5 pb-14 pt-10 md:px-8 lg:pt-14">
        <HeroItem className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 bg-[color:var(--v2-accent)]"
          />
          <p className="v2-mono text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-soft)]">
            Nº 01 — Le geste et la trace
          </p>
        </HeroItem>

        <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
          <div>
            <h1 className="v2-display text-[clamp(3.1rem,6.8vw,6.4rem)] font-medium leading-[0.95] tracking-[-0.02em] text-[color:var(--v2-ink)]">
              <HeroLine innerClassName="pb-[0.14em] -mb-[0.14em]">
                Votre regard
              </HeroLine>
              <HeroLine innerClassName="pb-[0.14em] -mb-[0.14em]">
                métier, jusqu&rsquo;au
              </HeroLine>
              <HeroLine innerClassName="pb-[0.16em] -mb-[0.12em]">
                <em className="v2-display-wonk not-italic">
                  <span className="v2-hand-circle inline-block px-3 italic text-[color:var(--v2-accent-deep)]">
                    propriétaire.
                  </span>
                </em>
              </HeroLine>
            </h1>

            <HeroItem className="mt-8 max-w-[52ch]">
              <p className="text-pretty text-base leading-7 text-[color:var(--v2-ink-soft)] md:text-lg md:leading-8">
                Biume transforme vos notes en un compte rendu clair, que vous
                relisez, adaptez et partagez uniquement quand vous le décidez.
              </p>
            </HeroItem>

            <HeroItem className="mt-10">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  data-conversion="hero-signup"
                  className="v2-mono inline-flex min-h-12 items-center justify-center bg-[color:var(--v2-ink)] px-7 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[color:var(--v2-paper)] transition-colors duration-200 hover:bg-[color:var(--v2-accent-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--v2-accent-deep)] active:scale-[0.98]"
                >
                  Essayer gratuitement
                </Link>
                <Link
                  href="https://cal.com/mathieu-chambaud-biume"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion="hero-demo"
                  className="v2-link v2-mono inline-flex min-h-12 items-center text-[0.7rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink)]"
                >
                  Demander une démo&nbsp;↗
                </Link>
              </div>
              <p className="v2-mono mt-4 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                15 jours d&rsquo;essai — sans carte bancaire
              </p>
            </HeroItem>
          </div>

          <div className="relative">
            <HeroItem>
              <TransformationArtifact
                note={REPORT_TRANSFORMATION_DEMO.note}
                sections={REPORT_TRANSFORMATION_DEMO.sections}
                ownerSummary={REPORT_TRANSFORMATION_DEMO.ownerSummary}
              />
            </HeroItem>

            <HeroItem className="relative z-10 mt-10 lg:-mt-14 lg:ml-24 lg:max-w-[26rem]">
              <figure className="v2-plate relative rotate-[1.2deg] border border-[color:var(--v2-line)] bg-[color:var(--v2-sheet)] p-2 shadow-[0_24px_44px_-28px_rgba(28,25,23,0.5)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/assets/images/landing/atelier-hero.webp"
                    alt="Une ostéopathe animalière termine une séance calme auprès d'un cheval"
                    fill
                    sizes="(min-width: 1024px) 26rem, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="v2-mono flex items-baseline justify-between gap-4 px-1 pb-1 pt-2 text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                  <span>Planche I — Séance auprès d&rsquo;un cheval</span>
                  <span>14:32</span>
                </figcaption>
              </figure>
            </HeroItem>
          </div>
        </div>

        <HeroItem className="border-t border-[color:var(--v2-line)] pt-5">
          <div className="v2-mono flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 text-[0.62rem] uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
            <span>Ostéopathie animalière</span>
            <span>Compte rendu propriétaire</span>
            <span>Suivi post-séance</span>
            <span className="hidden md:inline">Édition Nº 02 · 2026</span>
          </div>
        </HeroItem>
      </HeroReveal>
    </section>
  );
}
