"use client";

import { motion, useReducedMotion } from "motion/react";

const steps = [
  {
    title: "Compte rendu finalisé",
    body: "Vous relisez et finalisez le document après la séance.",
    confirmed: false,
  },
  {
    title: "Suivi préparé",
    body: "Vous préparez le rappel et choisissez sa date ainsi que son message.",
    confirmed: false,
  },
  {
    title: "Rappel programmé",
    body: "Le rappel est enregistré pour le propriétaire à la date choisie.",
    confirmed: true,
  },
] as const;

export function FollowUpFlow() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="comment-ca-marche"
      data-landing-section="follow-up"
      className="scroll-mt-20 bg-[color:var(--machine-anthracite)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">
          La séance se termine. Le suivi se prépare.
        </h2>
        <p className="mt-5 max-w-[60ch] text-base leading-7 text-white/70 md:text-lg">
          Vous finalisez le compte rendu, préparez le suivi, puis programmez le
          rappel que vous avez choisi.
        </p>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              data-follow-up-step={step.title}
              initial={reduceMotion ? false : { x: -8 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{
                duration: reduceMotion ? 0 : 0.42,
                delay: reduceMotion ? 0 : index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-[var(--machine-surface-radius)] bg-white/[0.07] p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-white/55">
                  0{index + 1}
                </span>
                {step.confirmed ? (
                  <span className="rounded-full bg-[color:var(--machine-green-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--machine-green-ink)]">
                    Confirmé
                  </span>
                ) : null}
              </div>
              <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
