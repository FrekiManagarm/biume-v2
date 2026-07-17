import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { REPORT_TRANSFORMATION_DEMO } from "./report-transformation-demo";

export function LandingHero() {
  return (
    <section
      data-landing-section="hero"
      className="px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16"
    >
      <div className="relative mx-auto min-h-[46rem] max-w-[90rem] overflow-hidden lg:min-h-[44rem]">
        <div className="relative z-20 max-w-[46rem] pt-8 lg:w-[55%] lg:pt-20">
          <h1 className="max-w-[11ch] text-balance text-[clamp(3.25rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.038em]">
            Votre regard métier,{" "}
            <span className="text-[color:var(--atelier-violet)]">
              jusqu’au propriétaire.
            </span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-[color:var(--atelier-muted)] md:text-lg">
            Biume transforme vos notes en un compte rendu clair, que vous
            relisez, adaptez et partagez uniquement quand vous le décidez.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--atelier-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
            >
              Préparer mon premier compte rendu
            </Link>
            <Link
              href="#produit"
              className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] px-6 text-sm font-semibold text-[color:var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
            >
              Voir le parcours
            </Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--atelier-muted)]">
            <li>15 jours gratuits</li>
            <li>Sans carte bancaire</li>
          </ul>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[25rem] overflow-hidden rounded-[var(--atelier-media-radius)] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[48%]">
          <Image
            src="/assets/images/landing/atelier-hero.webp"
            alt="Une ostéopathe animalière termine une séance calme auprès d’un cheval"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
        </div>
        <div
          data-hero-product-preview="true"
          className="absolute bottom-6 left-0 z-30 w-[min(34rem,88%)] rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-surface)] shadow-[0_6px_8px_rgba(107,90,200,0.16)] lg:bottom-10 lg:left-[40%]"
        >
          <div className="flex items-center justify-between border-b border-[color:var(--atelier-line)] px-5 py-4">
            <p className="text-sm font-semibold">Préparation propriétaire</p>
            <span className="rounded-full bg-[color:var(--atelier-violet-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--atelier-violet)]">
              À relire
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-5">
            <div className="rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-muted-surface)] p-4">
              <h2 className="text-xs font-semibold">Notes professionnelles</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--atelier-muted)]">
                {REPORT_TRANSFORMATION_DEMO.note}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="mx-auto hidden h-1 w-8 rounded-full bg-[color:var(--atelier-blue)] sm:block"
            />
            <div className="rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-violet-soft)] p-4">
              <h2 className="text-xs font-semibold">Version propriétaire</h2>
              <p className="mt-2 text-sm leading-6">
                {REPORT_TRANSFORMATION_DEMO.ownerSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
