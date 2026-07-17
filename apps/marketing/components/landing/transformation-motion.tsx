"use client";

import { motion, useReducedMotion } from "motion/react";

export type TransformationStage = {
  id: "notes" | "proposal" | "review";
  title: string;
  body: string;
  tone: "neutral" | "blue" | "violet";
};

const toneClasses: Record<TransformationStage["tone"], string> = {
  neutral:
    "bg-[color:var(--atelier-anthracite)] text-white shadow-[0_4px_8px_rgba(29,29,33,0.14)]",
  blue:
    "bg-[color:var(--atelier-blue-soft)] text-[color:var(--atelier-ink)]",
  violet:
    "bg-[color:var(--atelier-violet-soft)] text-[color:var(--atelier-ink)] shadow-[0_6px_8px_rgba(107,90,200,0.16)]",
};

export function TransformationMotion({
  stages,
}: {
  stages: readonly TransformationStage[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative grid gap-5 lg:min-h-[42rem]">
      {stages.map((stage, index) => (
        <motion.article
          key={stage.id}
          data-transformation-stage={stage.id}
          initial={false}
          whileInView={
            reduceMotion
              ? undefined
              : { y: index * -10, rotate: (index - 1) * 0.6 }
          }
          viewport={{ once: true, amount: 0.55 }}
          transition={{
            duration: reduceMotion ? 0 : 0.52,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`rounded-[var(--atelier-surface-radius)] p-6 ${toneClasses[stage.tone]}`}
        >
          <h3 className="text-balance text-xl font-semibold tracking-[-0.02em]">
            {stage.title}
          </h3>
          <p
            className={`mt-4 max-w-[65ch] text-pretty text-sm leading-6 ${
              stage.tone === "neutral"
                ? "text-white/75"
                : "text-[color:var(--atelier-muted)]"
            }`}
          >
            {stage.body}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
