import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../lib/web-app-url";

export function CTASection() {
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="p-6 md:p-10 lg:p-12">
          <h2 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
            Donnez une suite claire à chaque séance.
          </h2>
          <p className="mt-5 max-w-[50ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Essayez Biume pendant 15 jours, sans carte bancaire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
            >
              Voir la démonstration
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] bg-muted lg:m-4 lg:ml-0 lg:rounded-xl lg:overflow-hidden">
          <Image
            src="/assets/images/landing/practitioner-owner-animal.png"
            alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
            fill
            sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
