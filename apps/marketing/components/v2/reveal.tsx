"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function V2MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Filet horizontal qui se dessine à l'entrée dans le viewport. */
export function RuleDraw({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      style={{ transformOrigin: "left center" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1.2, ease: EASE }}
    />
  );
}

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

/** Orchestration du chargement hero (parent des HeroLine / HeroItem). */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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

/** Ligne de titre masquée qui monte (à placer sous HeroReveal). */
export function HeroLine({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className ?? ""}`.trim()}>
      <motion.span
        className={`block ${innerClassName ?? ""}`.trim()}
        variants={{ hidden: { y: "112%" }, visible: { y: "0%" } }}
        transition={{ duration: 1.05, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Élément hero simple (fondu + montée), cadencé par le stagger parent. */
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
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Trait SVG qui se trace à l'entrée dans le viewport. */
export function DrawnPath({
  d,
  className,
  strokeWidth = 1.5,
  delay = 0,
}: {
  d: string;
  className?: string;
  strokeWidth?: number;
  delay?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray="0 1"
      className={className}
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1.4, delay, ease: "easeInOut" }}
    />
  );
}
