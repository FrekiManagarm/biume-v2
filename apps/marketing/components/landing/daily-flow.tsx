const dailySteps = [
  { label: "Séance", detail: "Vous restez concentré sur l’animal." },
  { label: "Notes", detail: "Vos observations gardent votre vocabulaire." },
  { label: "Compte rendu", detail: "Biume structure une base précise." },
  { label: "Partage", detail: "Vous relisez avant chaque envoi." },
  { label: "Suivi", detail: "La prochaine étape reste visible." },
] as const;

export function DailyFlow() {
  return (
    <section
      id="comment-ca-marche"
      data-landing-section="daily-flow"
      className="scroll-mt-24 px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)] lg:self-start">
            Le temps retrouvé
          </p>

          <div className="min-w-0">
            <h2 className="max-w-[18ch] text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
              Une journée de cabinet, sans ressaisie.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8">
              De la séance au suivi, Biume garde le même fil pour éviter de
              recommencer le travail à chaque étape.
            </p>
          </div>
        </div>

        <ol className="mt-10 grid min-w-0 border-y border-[color:var(--carnet-line)] md:grid-cols-5">
          {dailySteps.map((step, index) => {
            const accentClass =
              index === dailySteps.length - 1
                ? "text-[color:var(--carnet-green-ink)]"
                : index >= 2
                  ? "text-[color:var(--carnet-blue)]"
                  : "text-[color:var(--carnet-violet)]";

            return (
              <li
                key={step.label}
                data-daily-step={step.label}
                className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-b border-[color:var(--carnet-line)] py-6 last:border-b-0 md:block md:border-r md:border-b-0 md:px-6 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${accentClass}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)] md:mt-8">
                    {step.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--carnet-muted)]">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
