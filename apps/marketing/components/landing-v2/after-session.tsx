import Image from "next/image";

import { Reveal } from "./motion";

/**
 * Respiration après la séquence sombre : une photographie porte le
 * registre, le bleu de liaison porte la continuité. Aucune carte,
 * aucune icône répétée — le rythme change franchement.
 */

const STEPS = [
  {
    title: "Vous finalisez le compte rendu",
    body: "Le document est relu, validé, puis envoyé au propriétaire au format PDF.",
  },
  {
    title: "Vous choisissez le prochain contact",
    body: "Date et message sont fixés par vous, au moment où le contexte de la séance est encore frais.",
  },
  {
    title: "Le rappel arrive à la date prévue",
    body: "Vous reprenez le fil sans avoir à retrouver ce qui avait été observé la fois précédente.",
  },
] as const;

export function AfterSession() {
  return (
    <section
      id="suivi"
      aria-labelledby="lv2-suivi-title"
      className="scroll-mt-20 border-t border-[color:var(--lv2-line)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <Reveal className="lg:order-last">
            <div>
              <Image
                src="/assets/images/landing/atelier-owner.webp"
                alt="Une ostéopathe animalière explique la séance à la propriétaire d'un chien, assises toutes deux près de l'animal."
                width={1122}
                height={1402}
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="h-auto w-full rounded-[var(--lv2-r-media)]"
              />
            </div>
          </Reveal>

          <div>
            <Reveal as="h2">
              <span
                id="lv2-suivi-title"
                className="lv2-headline block max-w-[18ch] text-[color:var(--lv2-ink)]"
              >
                Le compte rendu ouvre la suite.
              </span>
            </Reveal>

            <Reveal as="p">
              <span className="lv2-body mt-5 block">
                Le document n&apos;est pas une fin. Il fixe ce qui a été
                travaillé, ce qui doit être observé, et quand vous reprendrez
                contact.
              </span>
            </Reveal>

            <Reveal>
              <ol className="mt-10 space-y-0">
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="relative grid grid-cols-[28px_1fr] gap-x-5 pb-9 last:pb-0"
                  >
                    {/* Le fil bleu relie les étapes entre elles. */}
                    {index < STEPS.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-[13px] top-4 h-full w-px bg-[color:var(--lv2-blue)]"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full border border-[color:var(--lv2-blue)] bg-[color:var(--lv2-blue-soft)] text-[0.78rem] font-semibold text-[color:var(--lv2-blue-ink)]"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-[1.05rem] font-semibold text-[color:var(--lv2-ink)]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 max-w-[48ch] text-[0.95rem] leading-[1.6] text-[color:var(--lv2-ink-2)]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
