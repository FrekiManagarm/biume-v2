import { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { CinematicHeroMedia } from "./cinematic-hero-media";
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
  const alt =
    "Une ostéopathe animalière observe un cheval pendant une séance";
  const desktopImage = getImageProps({
    src: "/assets/images/landing/hero-practitioner-horse.png",
    alt,
    width: 1122,
    height: 1402,
    quality: 55,
    sizes: "(min-width: 1280px) 100vw, 100vw",
  });
  const mobileImage = getImageProps({
    src: "/assets/images/landing/hero-practitioner-horse-mobile.webp",
    alt,
    width: 640,
    height: 800,
    quality: 48,
    sizes: "100vw",
  });

  return (
    <section
      data-landing-section="hero"
      className="cinematic-hero relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden"
    >
      <CinematicHeroMedia
        alt={alt}
        desktop={{
          src: desktopImage.props.src,
          srcSet: desktopImage.props.srcSet,
          sizes: desktopImage.props.sizes,
        }}
        mobile={{ srcSet: mobileImage.props.srcSet }}
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[90rem] content-end gap-8 px-4 pb-2 pt-20 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,25rem)] lg:items-end lg:gap-12 lg:px-8 lg:pb-10 lg:pt-24">
        <div className="max-w-[46rem]">
          <p className="cinematic-scene-label">Scène 01 · Le geste</p>
          <p
            data-hero-entry
            style={entryStyle(0)}
            className="landing-hero-entry mt-4 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[#fffaf2]/75"
          >
            Le compte rendu propriétaire des ostéopathes animaliers
          </p>
          <h1
            data-hero-entry
            style={entryStyle(80)}
            className="carnet-hero-sans landing-hero-entry mt-4 text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[#fffaf2]"
          >
            Vos observations,{" "}
            <span className="carnet-hero-serif font-normal italic tracking-[-0.045em]">
              dans des mots qui restent.
            </span>
          </h1>
          <p
            data-hero-entry
            style={entryStyle(160)}
            className="landing-hero-entry mt-5 max-w-[56ch] text-base leading-7 text-[#fffaf2]/80 md:text-lg md:leading-8"
          >
            Biume structure vos notes et prépare un compte rendu clair pour le
            propriétaire. Vous relisez, corrigez et choisissez quand le
            partager.
          </p>
          <div
            data-hero-entry
            style={entryStyle(240)}
            className="landing-hero-entry mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--cinematic-rust)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffaf2]"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#produit"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full border border-[#fffaf2]/35 bg-black/15 px-6 text-sm font-semibold text-[#fffaf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffaf2]"
            >
              Voir un exemple de compte rendu
            </Link>
          </div>
          <ul
            data-hero-entry
            style={entryStyle(320)}
            className="landing-hero-entry mt-6 grid grid-cols-3 border-y border-[#fffaf2]/20"
          >
            {reassurance.map((item) => (
              <li
                key={item}
                className="flex min-h-14 items-center gap-2 border-r border-[#fffaf2]/20 px-2 py-3 font-mono text-[0.61rem] font-semibold leading-4 text-[#fffaf2]/85 last:border-r-0 sm:px-4 sm:text-xs sm:first:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--cinematic-rust)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <article
          data-hero-product
          aria-label="Exemple de proposition adaptée dans Biume"
          className="w-full border border-black/15 bg-[color:var(--cinematic-paper)] text-[color:var(--carnet-ink)] shadow-[0_28px_80px_-48px_rgba(0,0,0,0.72)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-black/15 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
                Compte rendu propriétaire
              </p>
              <p className="mt-1 text-sm font-semibold">Proposition adaptée</p>
            </div>
            <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] font-semibold">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
              />
              Prêt à relire
            </span>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm leading-6">{adaptedProposal}</p>
            <div className="mt-5 flex flex-col gap-3 border-t border-black/15 pt-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <p className="text-xs leading-5 text-[color:var(--carnet-muted)]">
                Vous pouvez encore modifier ce texte
              </p>
              <span className="inline-flex min-h-9 items-center justify-center rounded-full bg-[color:var(--carnet-ink)] px-4 text-xs font-semibold text-white">
                Partager le PDF
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
