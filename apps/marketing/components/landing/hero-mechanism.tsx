"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function HeroMechanism({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-hero-mechanism
      initial={reduceMotion ? false : { scale: 1.015 }}
      animate={{ scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.72,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
