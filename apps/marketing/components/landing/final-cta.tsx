import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

export function FinalCta() {
  return (
    <aside
      data-final-cta
      className="mt-12 grid overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] md:mt-16 lg:grid-cols-[1.08fr_0.92fr]"
    >
      <div className="relative min-h-56 bg-[color:var(--carnet-muted-surface)] sm:min-h-72 lg:min-h-[30rem]">
        <Image
          src="/assets/images/landing/practitioner-owner-animal.png"
          alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
          fill
          sizes="(min-width: 1280px) 760px, (min-width: 1024px) 56vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
          Votre prochain compte rendu
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
          La séance est terminée.{" "}
          <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
            Le suivi peut commencer.
          </span>
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-7 text-[color:var(--carnet-muted)]">
          Créez votre espace et préparez un premier document.
        </p>
        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          data-conversion="final-signup"
          className="carnet-action mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
        >
          Essayer gratuitement
        </Link>
      </div>
    </aside>
  );
}
