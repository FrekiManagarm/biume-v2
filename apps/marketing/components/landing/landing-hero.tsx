import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../../lib/web-app-url";
import type { ReportTransformationDemo } from "./report-transformation-demo";

const reassurance = [
  "15 jours d'essai",
  "Sans carte bancaire",
  "Partagé par vous",
] as const;

const entryStyle = (delay: number) =>
  ({ "--hero-delay": `${delay}ms` }) as CSSProperties;

export function LandingHero({
  adaptedProposal,
}: Pick<ReportTransformationDemo, "adaptedProposal">) {
  return (
    <section
      data-landing-section="hero"
      className="relative px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="carnet-construction absolute inset-x-0 top-0 -z-10 h-[78%]"
      />
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[90rem] items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-16">
        <div className="max-w-[42rem] py-4 lg:py-12">
          <p
            data-hero-entry
            style={entryStyle(0)}
            className="landing-hero-entry font-mono text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--carnet-violet)]"
          >
            Le compte rendu propriétaire des ostéopathes animaliers
          </p>
          <h1
            data-hero-entry
            style={entryStyle(80)}
            className="landing-hero-entry mt-5 text-[clamp(3.25rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[color:var(--carnet-ink)]"
          >
            Vos observations,{" "}
            <span className="font-[family-name:var(--font-newsreader)] font-normal italic tracking-[-0.045em]">
              dans des mots qui restent.
            </span>
          </h1>
          <p
            data-hero-entry
            style={entryStyle(160)}
            className="landing-hero-entry mt-6 max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8"
          >
            Biume structure vos notes et prépare un compte rendu clair pour le
            propriétaire. Vous relisez, corrigez et choisissez quand le
            partager.
          </p>
          <div
            data-hero-entry
            style={entryStyle(240)}
            className="landing-hero-entry mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#produit"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-6 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Voir un exemple de compte rendu
            </Link>
          </div>
          <ul
            data-hero-entry
            style={entryStyle(320)}
            className="landing-hero-entry mt-9 grid grid-cols-3 border-y border-[color:var(--carnet-line)]"
          >
            {reassurance.map((item) => (
              <li
                key={item}
                className="flex min-h-16 items-center gap-2 border-r border-[color:var(--carnet-line)] px-2 py-3 font-mono text-[0.64rem] font-semibold leading-4 text-[color:var(--carnet-ink)] last:border-r-0 sm:px-4 sm:text-xs sm:first:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--carnet-violet)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[48rem] lg:justify-self-end">
          <div
            data-hero-photo
            className="landing-hero-photo relative aspect-[5/4] overflow-hidden rounded-[2rem_0.75rem_2rem_0.75rem] bg-[color:var(--carnet-muted-surface)] sm:aspect-[4/5]"
          >
            <Image
              src="/assets/images/landing/hero-practitioner-horse.png"
              alt="Une ostéopathe animalière observe un cheval pendant une séance"
              fill
              priority
              fetchPriority="high"
              quality={65}
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>

          <article
            data-hero-product
            aria-label="Exemple de proposition adaptée dans Biume"
            className="relative z-10 mx-auto -mt-14 w-[calc(100%-1.5rem)] overflow-hidden rounded-[0.8rem_0.8rem_2rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-52px_rgba(29,29,33,0.45)] sm:-mt-20 sm:w-[88%] lg:mr-5"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--carnet-line)] px-5 py-4 sm:px-6">
              <div>
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
                  Compte rendu propriétaire
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--carnet-ink)]">
                  Proposition adaptée
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--carnet-green-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-ink)]">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
                />
                Prêt à relire
              </span>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-6 text-[color:var(--carnet-ink)] sm:text-base sm:leading-7">
                {adaptedProposal}
              </p>
              <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--carnet-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[color:var(--carnet-muted)]">
                  Vous pouvez encore modifier ce texte
                </p>
                <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-[color:var(--carnet-ink)] px-4 text-xs font-semibold text-white">
                  Partager le PDF
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
