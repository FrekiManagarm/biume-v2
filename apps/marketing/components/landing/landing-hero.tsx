import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { HeroMechanism } from "./hero-mechanism";

const reassurance = [
  "15 jours d’essai",
  "Sans carte bancaire",
  "Rien ne part sans vous",
] as const;

export function LandingHero({
  adaptedProposal,
}: {
  adaptedProposal?: string;
}) {
  void adaptedProposal;

  return (
    <section
      data-landing-section="hero"
      className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20"
    >
      <div className="mx-auto max-w-[90rem] text-center">
        <h1 className="mx-auto max-w-[15ch] text-balance text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.035em]">
          De vos notes au propriétaire, sans perdre votre regard métier.
        </h1>
        <p className="mx-auto mt-6 max-w-[62ch] text-pretty text-base leading-7 text-[color:var(--machine-muted)] md:text-lg md:leading-8">
          Biume organise vos observations en un compte rendu clair, puis vous
          aide à garder le fil après la séance. Vous relisez et décidez de
          chaque partage.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="hero-signup"
            className="machine-action inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--machine-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            Essayer gratuitement
          </Link>
          <Link
            href="https://cal.com/mathieu-chambaud-biume"
            target="_blank"
            rel="noopener noreferrer"
            data-conversion="hero-demo"
            className="machine-action inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--machine-line)] bg-[color:var(--machine-surface)] px-6 text-sm font-semibold text-[color:var(--machine-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            Demander une démo
          </Link>
        </div>
        <HeroMechanism>
          <div className="relative mx-auto mt-12 aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-[var(--machine-media-radius)] bg-[color:var(--machine-violet-soft)]">
            <Image
              src="/assets/images/landing/soft-machine-hero.png"
              alt="Un mécanisme abstrait transforme des notes en document structuré puis en suivi validé"
              fill
              priority
              sizes="(min-width: 1280px) 1024px, 92vw"
              className="object-cover"
            />
          </div>
        </HeroMechanism>
        <ul className="mx-auto mt-8 flex max-w-3xl flex-col border-y border-[color:var(--machine-line)] sm:flex-row">
          {reassurance.map((item) => (
            <li
              key={item}
              className="flex min-h-12 flex-1 items-center justify-center px-4 py-3 text-sm font-semibold sm:border-r sm:last:border-r-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
