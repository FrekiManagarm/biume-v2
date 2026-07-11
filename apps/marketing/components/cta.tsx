import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../lib/web-app-url";
import { MotionReveal } from "./landing/motion-reveal";

export function CTASection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div
        data-final-cta
        className="mx-auto grid max-w-7xl overflow-hidden rounded-[24px] border border-border bg-card text-card-foreground lg:grid-cols-12 lg:items-stretch"
      >
        <MotionReveal className="flex flex-col justify-center p-6 md:p-10 lg:col-span-5 lg:p-12">
          <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
            Donnez une suite claire à chaque séance.
          </h2>
          <p className="mt-5 max-w-[44ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Essayez Biume pendant 15 jours, sans carte bancaire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir la démonstration
            </Link>
          </div>
        </MotionReveal>

        <MotionReveal
          delay={0.08}
          className="landing-media-frame relative min-h-[22rem] bg-muted lg:col-span-7 lg:min-h-[38rem]"
        >
          <Image
            src="/assets/images/landing/practitioner-owner-animal.png"
            alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
            fill
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </MotionReveal>
      </div>
    </section>
  );
}
