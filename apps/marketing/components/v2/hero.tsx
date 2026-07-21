import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { HeroItem, HeroReveal } from "./reveal";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

export function V2Hero() {
  return (
    <section
      aria-labelledby="v2-hero-title"
      className="relative flex min-h-[92svh] items-center justify-center overflow-hidden"
    >
      {/* Paysage full-bleed — le seul moment de couleur de la page */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/assets/images/landing/atelier-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Lavis chaud aux couleurs de marque — violet et vert équilibrés */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 58% at 20% 76%, hsl(251 73% 72% / 0.5) 0%, transparent 62%), radial-gradient(64% 54% at 80% 18%, hsl(148 71% 45% / 0.34) 0%, transparent 60%)",
          }}
        />
        {/* Voile de lisibilité + fade complet vers le lin */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 58% at 50% 48%, rgba(247,246,242,0.38) 0%, rgba(247,246,242,0.18) 56%, transparent 100%), linear-gradient(180deg, rgba(247,246,242,0.54) 0%, rgba(247,246,242,0.28) 32%, rgba(247,246,242,0.4) 58%, rgba(247,246,242,0.88) 84%, #f7f6f2 100%)",
          }}
        />
      </div>

      <HeroReveal className="relative mx-auto w-full max-w-[1200px] px-5 pb-28 pt-24 text-center md:px-8">
        <HeroItem>
          <p className="v2-pill mx-auto w-fit">
            <span aria-hidden="true" className="v2-pill-dot" />
            Pour les ostéopathes animaliers indépendants
          </p>
        </HeroItem>

        <HeroItem>
          <h1
            id="v2-hero-title"
            className="v2-display mx-auto mt-7 max-w-[16ch] text-[clamp(2.9rem,7.2vw,5.5rem)] font-medium leading-[1.0] text-[color:var(--v2-ink)] [text-wrap:balance]"
          >
            Trois phrases. Un compte rendu.
          </h1>
        </HeroItem>

        <HeroItem>
          <p className="mx-auto mt-6 max-w-[54ch] text-[1.08rem] font-medium leading-[1.6] text-[color:var(--v2-ink)] [text-wrap:pretty]">
            Dictez vos observations entre deux écuries. Biume prépare un compte
            rendu propriétaire structuré — vous relisez, vous validez, il part.
          </p>
        </HeroItem>

        <HeroItem>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="v2-btn v2-btn-primary v2-btn-lg w-full sm:w-auto"
            >
              Commencer gratuitement
            </Link>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="hero-demo"
              className="v2-btn v2-btn-secondary v2-btn-lg w-full bg-white/90 backdrop-blur-sm sm:w-auto"
            >
              Demander une démo
            </a>
          </div>
        </HeroItem>

        <HeroItem>
          <p className="mt-6 text-[0.84rem] font-medium text-[color:var(--v2-ink)]">
            15 jours d’essai · Sans carte bancaire
          </p>
        </HeroItem>
      </HeroReveal>
    </section>
  );
}
