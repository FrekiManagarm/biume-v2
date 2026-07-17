import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

export function FinalCta() {
  return (
    <aside
      data-final-cta
      className="mt-12 grid overflow-hidden rounded-[var(--machine-surface-radius)] border border-[color:var(--machine-line)] bg-[color:var(--machine-surface)] md:mt-16 lg:grid-cols-[1.08fr_0.92fr]"
    >
      <div className="relative min-h-52 bg-[color:var(--machine-muted-surface)] sm:min-h-72 lg:min-h-[30rem]">
        <Image
          src="/assets/images/landing/practitioner-owner-animal.png"
          alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
          fill
          sizes="(min-width: 1280px) 760px, (min-width: 1024px) 56vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <h2 className="max-w-[15ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-[color:var(--machine-ink)]">
          Prêt à transformer votre prochain compte rendu ?
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-7 text-[color:var(--machine-muted)]">
          Créez votre espace et préparez un premier document.
        </p>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="final-signup"
            className="machine-action inline-flex min-h-12 w-fit items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--machine-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            Essayer gratuitement
          </Link>
          <Link
            href="https://cal.com/mathieu-chambaud-biume"
            target="_blank"
            rel="noopener noreferrer"
            data-conversion="final-demo"
            className="machine-action inline-flex min-h-12 w-fit items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--machine-line)] px-6 text-sm font-semibold text-[color:var(--machine-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            Demander une démo
          </Link>
        </div>
      </div>
    </aside>
  );
}
