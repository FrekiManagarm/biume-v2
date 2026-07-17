import type { JSX } from "react";

const steps = [
  {
    title: "Compte rendu finalisé",
    body: "Vous relisez et finalisez le document après la séance.",
    confirmed: false,
  },
  {
    title: "Suivi préparé",
    body: "Vous choisissez la date et le message du prochain rappel.",
    confirmed: false,
  },
  {
    title: "Rappel confirmé",
    body: "Le rappel est enregistré à la date que vous avez choisie.",
    confirmed: true,
  },
] as const;

export function FollowUpContinuity(): JSX.Element {
  return (
    <section
      id="methode"
      data-landing-section="follow-up"
      className="scroll-mt-20 bg-[color:var(--atelier-anthracite)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-16">
          <h2 className="max-w-[13ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-semibold leading-none tracking-[-0.03em]">
            Le compte rendu ouvre la suite.
          </h2>
          <p className="max-w-[58ch] text-pretty text-base leading-7 text-white/75 md:text-lg lg:justify-self-end">
            Vous finalisez le compte rendu, préparez le prochain contact et
            confirmez le rappel à la date choisie.
          </p>
        </div>

        <ol className="mt-12 grid gap-0 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-follow-up-step={step.title}
              className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 pb-10 last:pb-0 lg:grid-cols-1 lg:gap-5 lg:pb-0 lg:pr-10 lg:last:pr-0"
            >
              <div className="relative flex justify-center lg:justify-start">
                <span
                  className={`relative inline-flex size-11 items-center justify-center rounded-full text-sm font-semibold ${
                    step.confirmed
                      ? "bg-[color:var(--atelier-green-soft)] text-[color:var(--atelier-green-ink)]"
                      : "bg-[color:var(--atelier-blue-soft)] text-[color:var(--atelier-ink)]"
                  }`}
                >
                  {index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-2.5rem] top-11 w-0.5 bg-[color:var(--atelier-blue)] lg:bottom-auto lg:left-11 lg:right-0 lg:top-[1.3rem] lg:h-0.5 lg:w-auto"
                  />
                ) : null}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  {step.confirmed ? (
                    <span className="rounded-full bg-[color:var(--atelier-green-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--atelier-green-ink)]">
                      Confirmé
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-[34ch] text-sm leading-6 text-white/70">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
