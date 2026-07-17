import Image from "next/image";

export function UseMoments() {
  return (
    <section
      data-landing-section="use-moments"
      className="px-4 py-16 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <h2 className="max-w-[16ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">
          Trois moments où Biume fait la différence.
        </h2>

        <div className="mt-12 space-y-4">
          <article
            data-use-moment="report"
            className="grid overflow-hidden rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="relative min-h-72">
              <Image
                src="/assets/images/landing/hero-practitioner-horse.png"
                alt="Une ostéopathe animalière accompagne un cheval pendant une séance"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-10">
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">
                Rendre le compte rendu lisible
              </h3>
              <p className="mt-4 text-base leading-7 text-[color:var(--machine-muted)]">
                Gardez vos termes précis dans les notes, puis préparez une
                synthèse que le propriétaire peut relire après la séance.
              </p>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <article
              data-use-moment="follow-up"
              className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-blue-soft)] p-6 md:p-10"
            >
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">
                Préparer le suivi après la séance
              </h3>
              <div className="mt-8 rounded-[var(--machine-control-radius)] bg-[color:var(--machine-surface)] p-4">
                <span className="font-mono text-xs text-[color:var(--machine-muted)]">
                  DATE CHOISIE · À PRÉPARER
                </span>
                <p className="mt-3 text-sm leading-6">
                  Préparer le message destiné au propriétaire.
                </p>
              </div>
            </article>

            <article
              data-use-moment="history"
              className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-anthracite)] p-6 text-white md:p-10"
            >
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">
                Retrouver le fil à la prochaine consultation
              </h3>
              <ol className="mt-8 space-y-4 border-l border-white/20 pl-5">
                <li>
                  <span className="font-mono text-xs text-white/50">12 MAI</span>
                  <p className="mt-1 text-sm">Séance et compte rendu finalisé</p>
                </li>
                <li>
                  <span className="font-mono text-xs text-white/50">19 MAI</span>
                  <p className="mt-1 text-sm">
                    Rappel programmé pour le propriétaire
                  </p>
                </li>
              </ol>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
