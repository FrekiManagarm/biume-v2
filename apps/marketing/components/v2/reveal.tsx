"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scope de motion pour la landing v2.
 * - whileInView : entrance only, `once` — aucune boucle perpétuelle
 * - reduced-motion : rendu final immédiat, sans animation
 */
export function V2MotionRoot({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [...EASE] }}>
      {children}
    </MotionConfig>
  );
}

/** Reveal d'entrée simple (fade + translation courte), une seule fois. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [...EASE] }}
    >
      {children}
    </motion.div>
  );
}

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
} as const;

/** Orchestrateur du hero : stagger d'entrée, une seule fois. */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={heroContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/** Item simple dans l'orchestration hero. */
export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [...EASE] } },
      }}
    >
      {children}
    </motion.div>
  );
}
