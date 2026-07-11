import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../lib/web-app-url";

const reassurance = [
  { value: "15 jours", label: "Essai gratuit" },
  { value: "Sans carte bancaire", label: "Vous testez librement" },
  { value: "Validé par vous", label: "Votre expertise reste centrale" },
] as const;

export function HeroSection() {
  return (
    <section className="px-4 pb-16 pt-10 md:px-6 md:pb-22 md:pt-14">
      <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="max-w-2xl">
          <p className="landing-reveal font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Le suivi post-séance des ostéopathes animaliers
          </p>
          <h1 className="landing-reveal landing-reveal-delay-1 mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
            Chaque séance mérite une suite.
          </h1>
          <p className="landing-reveal landing-reveal-delay-2 mt-6 max-w-[58ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Biume transforme vos observations en un suivi clair que les propriétaires comprennent, gardent et utilisent.
          </p>
          <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#parcours"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir le parcours
            </Link>
          </div>
        </div>

        <div className="landing-media-reveal relative mx-auto w-full max-w-3xl lg:justify-self-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-muted">
            <Image
              src="/assets/images/landing/hero-practitioner-horse.png"
              alt="Une ostéopathe animalière auprès d'un cheval pendant une séance"
              fill
              priority
              sizes="(min-width: 1280px) 700px, (min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="relative -mt-8 ml-auto mr-4 w-[min(24rem,calc(100%-2rem))] rounded-xl border border-border bg-card p-4 text-card-foreground shadow-[0_20px_50px_-32px_rgba(24,23,26,0.45)] sm:-mt-12 sm:mr-8 sm:p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Exemple de suivi
            </p>
            <p className="mt-2 text-base font-semibold">Naya va mieux depuis la séance</p>
            <p className="mt-3 text-sm font-medium text-secondary">Retour reçu à J+7</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
        {reassurance.map((item) => (
          <div
            key={item.value}
            className="border-b border-border px-2 py-5 last:border-b-0 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <p className="font-mono text-sm font-semibold text-foreground md:text-base">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
