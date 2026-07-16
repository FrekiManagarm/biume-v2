import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { LivingSystemScene } from "./living-system-scene";

export function LandingHero() {
  return (
    <section
      data-landing-section="hero"
      className="px-4 pb-10 pt-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[color:var(--carnet-anthracite)] sm:rounded-[3rem]">
        <LivingSystemScene />

        <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:px-14 lg:py-14 xl:px-16">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--carnet-blue)] sm:text-xs">
              Votre journée, mieux orchestrée
            </p>
            <h1 className="mt-4 max-w-[15ch] text-left text-4xl font-semibold leading-[0.94] tracking-[-0.055em] text-[color:var(--carnet-surface)] sm:text-5xl lg:text-7xl">
              Moins d’administratif. Plus de temps pour soigner.
            </h1>
          </div>

          <div className="flex flex-col justify-end lg:pb-1">
            <p className="max-w-[52ch] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              Biume transforme vos notes en comptes rendus précis et clairs,
              puis garde le fil du suivi propriétaire.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="hero-signup"
                className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-px active:scale-[0.98]"
              >
                Essayer gratuitement
              </Link>
              <Link
                href="https://cal.com/mathieu-chambaud-biume"
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="hero-demo"
                className="carnet-action hidden min-h-12 items-center justify-center rounded-full bg-[color:var(--carnet-surface)] px-6 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-px active:scale-[0.98] sm:inline-flex"
              >
                Réserver une démo
                <span className="sr-only"> (ouvre un nouvel onglet)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
