import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../lib/web-app-url";

const reassurance = [
  { value: "15 jours", label: "Essai gratuit" },
  { value: "Sans carte bancaire", label: "Vous testez librement" },
  { value: "Validé par vous", label: "Votre expertise reste centrale" },
] as const;

export function HeroSection() {
  return (
    <section className="px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="relative z-10 max-w-2xl lg:col-span-6 lg:py-12">
          <p className="landing-reveal font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Le suivi post-séance des ostéopathes animaliers
          </p>
          <h1 className="landing-reveal landing-reveal-delay-1 mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[3.5rem] xl:text-[4.75rem]">
            Chaque séance mérite une suite.
          </h1>
          <p className="landing-reveal landing-reveal-delay-2 mt-6 max-w-[52ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Biume transforme vos observations en un suivi clair que les propriétaires comprennent, gardent et utilisent.
          </p>
          <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#parcours"
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir le parcours
            </Link>
          </div>
        </div>

        <div className="landing-hero-media landing-media-frame relative mx-auto aspect-[4/5] w-full max-w-[42rem] overflow-hidden rounded-[24px] bg-muted lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:justify-self-end lg:aspect-[5/6] lg:-mr-8 xl:-mr-16">
          <Image
            src="/assets/images/landing/hero-practitioner-horse.png"
            alt="Une ostéopathe animalière auprès d'un cheval pendant une séance"
            fill
            priority
            sizes="(min-width: 1280px) 670px, (min-width: 1024px) 56vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="landing-reassurance mx-auto mt-6 max-w-7xl border-t border-border">
        <div className="grid sm:grid-cols-3">
          {reassurance.map((item, index) => (
            <div
              key={item.value}
              className="landing-reassurance-item border-b border-border py-5 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              style={{ "--reassurance-index": index } as CSSProperties}
            >
              <p className="font-mono text-sm font-semibold text-foreground md:text-base">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
