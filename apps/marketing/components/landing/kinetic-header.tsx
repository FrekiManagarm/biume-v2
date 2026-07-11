"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";

export function KineticHeader({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const innerY = useTransform(scrollY, [0, 96], [0, -2]);
  const innerScale = useTransform(scrollY, [0, 96], [1, 0.97]);

  return (
    <LazyMotion features={domAnimation} strict>
      <header className="sticky inset-x-0 top-0 z-40 isolate border-b border-border/70">
        <m.div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-background/95 backdrop-blur-xl"
        />
        <m.div
          className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-6"
          style={reduceMotion ? undefined : { y: innerY, scale: innerScale }}
        >
          {children}
        </m.div>
      </header>
    </LazyMotion>
  );
}
