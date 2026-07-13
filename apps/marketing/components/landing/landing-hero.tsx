import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../../lib/web-app-url";
import {
  REPORT_NOTE_SUMMARY,
  type ReportTransformationDemo,
} from "./report-transformation-demo";

const reassurance = [
  "15 jours d’essai",
  "Sans carte bancaire",
  "Rien ne part sans vous",
] as const;

const entryStyle = (delay: number) =>
  ({ "--hero-delay": `${delay}ms` }) as CSSProperties;

const brandRailStyle = {
  background:
    "linear-gradient(to bottom, var(--carnet-logo-violet) 0 33.333%, var(--carnet-logo-blue) 33.333% 66.666%, var(--carnet-logo-green) 66.666% 100%)",
} satisfies CSSProperties;

export function LandingHero({
  adaptedProposal,
}: Pick<ReportTransformationDemo, "adaptedProposal">) {
  return (
    <section
      data-landing-section="hero"
      className="relative overflow-x-clip px-4 pb-10 pt-6 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="carnet-construction absolute inset-x-0 top-0 -z-10 h-[78%]"
      />
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[90rem] items-center gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-16">
        <div className="max-w-[42rem] py-0 lg:py-12">
          <p
            data-hero-entry
            style={entryStyle(0)}
            className="landing-hero-entry font-mono text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--carnet-violet)]"
          >
            Le lien après la séance
          </p>
          <h1
            data-hero-entry
            style={entryStyle(80)}
            className="carnet-hero-sans landing-hero-entry mt-5 text-[clamp(3.25rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[color:var(--carnet-ink)]"
          >
            Vos observations restent précises.{" "}
            <span className="carnet-hero-serif font-normal italic tracking-[-0.045em]">
              Le propriétaire, lui, comprend.
            </span>
          </h1>
          <p
            data-hero-entry
            style={entryStyle(160)}
            className="landing-hero-entry mt-6 max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8"
          >
            Biume part de vos mots, structure un compte rendu clair, puis vous
            aide à garder le fil après la séance. Vous relisez et décidez de
            chaque envoi.
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
              Voir le parcours
            </Link>
          </div>
          <ul
            data-hero-entry
            style={entryStyle(320)}
            className="landing-hero-entry mt-8 grid grid-cols-3 border-y border-[color:var(--carnet-line)]"
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

        <div className="relative mx-auto min-h-[34rem] w-full max-w-[48rem] overflow-hidden sm:overflow-visible md:min-h-[38rem] lg:justify-self-end">
          <div
            data-hero-photo
            className="landing-hero-photo absolute inset-0 overflow-hidden rounded-[2.75rem_1rem_4.75rem_1.5rem] bg-[color:var(--carnet-muted-surface)]"
          >
            <Image
              src="/assets/images/landing/hero-practitioner-horse.png"
              alt="Une ostéopathe animalière observe un cheval pendant une séance"
              fill
              loading="lazy"
              quality={55}
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>

          <span
            data-hero-brand-rail
            aria-hidden="true"
            style={brandRailStyle}
            className="absolute right-5 top-5 z-10 hidden h-36 w-1 rounded-full shadow-[0_0_0_1px_rgb(255_255_255/0.35)] sm:block"
          />

          <aside
            data-hero-note
            className="landing-hero-note absolute left-3 top-5 z-20 w-[min(17rem,calc(100%-1.5rem))] rounded-[0.75rem_0.75rem_2rem_0.75rem] border-l-2 border-[color:var(--carnet-logo-violet)] bg-[color:var(--carnet-anthracite)] px-4 py-4 text-white shadow-[0_22px_64px_-36px_rgb(0_0_0/0.75)] sm:-left-4 sm:top-8 sm:w-[18rem] sm:px-5"
          >
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-violet)]">
              Note de séance
            </p>
            <p className="mt-3 text-sm leading-6 text-white/90">
              {REPORT_NOTE_SUMMARY}
            </p>
          </aside>

          <article
            data-hero-report
            aria-label="Compte rendu propriétaire prêt à relire"
            className="landing-hero-report absolute bottom-4 right-3 z-30 w-[calc(100%-1.5rem)] max-w-[26rem] overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-46px_rgba(29,29,33,0.6)] sm:bottom-7 sm:right-5 sm:max-w-[23rem] md:max-w-[26rem]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[color:var(--carnet-line)] px-4 py-4 sm:px-5">
              <p className="max-w-[12rem] font-mono text-[0.65rem] font-semibold uppercase leading-4 tracking-[0.14em] text-[color:var(--carnet-muted)]">
                Compte rendu propriétaire
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--carnet-green-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-ink)]">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
                />
                Prêt à relire
              </span>
            </div>
            <div className="px-4 py-5 sm:px-5">
              <p className="text-sm leading-6 text-[color:var(--carnet-ink)] sm:text-base sm:leading-7">
                {adaptedProposal}
              </p>
              <p className="mt-5 border-t border-[color:var(--carnet-line)] pt-4 text-xs leading-5 text-[color:var(--carnet-muted)]">
                Vous pouvez encore modifier ce texte
              </p>
            </div>
          </article>

          <div
            data-hero-journey
            className="absolute bottom-7 left-5 z-20 hidden rounded-full border border-white/45 bg-[color:var(--carnet-anthracite)]/90 px-4 py-2.5 text-white shadow-[0_18px_48px_-30px_rgb(0_0_0/0.75)] backdrop-blur-sm xl:block"
          >
            <ol
              aria-label="Parcours : séance, PDF, suivi"
              className="flex items-center gap-2 font-mono text-[0.58rem] font-semibold tracking-[0.12em]"
            >
              {["SÉANCE", "PDF", "SUIVI"].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="h-px w-3 bg-[color:var(--carnet-logo-blue)]"
                    />
                  ) : null}
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
