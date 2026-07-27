import Image from "next/image";

import { Reveal } from "./motion";

/**
 * Chapitre 04 — la continuité, posée sur le plan bleu doux.
 *
 * Le bleu est la couleur de liaison du système : c'est le seul
 * chapitre où il porte le fond, et il porte aussi le fil qui relie
 * les étapes. Registre photographique après deux chapitres d'interface.
 */

const STEPS = [
  {
    title: "Vous finalisez le compte rendu",
    body: "Le document est relu, validé, puis envoyé au propriétaire au format PDF.",
  },
  {
    title: "Vous choisissez le prochain contact",
    body: "Date et message sont fixés par vous, pendant que le contexte de la séance est encore frais.",
  },
  {
    title: "Le rappel arrive à la date prévue",
    body: "Vous reprenez le fil sans avoir à retrouver ce qui avait été observé la fois précédente.",
  },
] as const;

export function FollowUp() {
  return (
    <section
      id="suivi"
      aria-labelledby="lv3-suivi-title"
      className="scroll-mt-24 bg-[color:var(--lv3-blue-soft)]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <Reveal>
            <Image
              src="/assets/images/landing/atelier-owner.webp"
              alt="Une ostéopathe animalière explique la séance à la propriétaire d'un chien, assises toutes deux près de l'animal."
              width={1122}
              height={1402}
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="h-auto w-full rounded-[var(--lv3-r-media)]"
            />
          </Reveal>

          <div>
            <Reveal as="h2">
              <span
                id="lv3-suivi-title"
                className="lv3-chapter-title block max-w-[16ch] text-[color:var(--lv3-ink)]"
              >
                Le compte rendu ouvre la suite.
              </span>
            </Reveal>
            <Reveal as="p">
              <span className="lv3-lead mt-5 block text-[color:var(--lv3-ink-2)]">
                Le document n&apos;est pas une fin. Il fixe ce qui a été
                travaillé, ce qui doit être observé, et quand vous reprendrez
                contact.
              </span>
            </Reveal>

            <Reveal>
              <ol className="mt-10">
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="relative grid grid-cols-[28px_1fr] gap-x-5 pb-9 last:pb-0"
                  >
                    {index < STEPS.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-[13px] top-4 h-full w-px bg-[color:var(--lv3-blue)]"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-0.5 flex size-7 items-center justify-center rounded-full border border-[color:var(--lv3-blue)] bg-[color:var(--lv3-surface)] text-[0.75rem] font-semibold text-[color:var(--lv3-blue-ink)]"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-[1.05rem] font-semibold text-[color:var(--lv3-ink)]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-[1.6] text-[color:var(--lv3-ink-2)]">
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
