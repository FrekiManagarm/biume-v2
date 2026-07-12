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

export function HeaderMotion({ children }: Readonly<{ children: ReactNode }>) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const surfaceOpacity = useTransform(scrollY, [0, 96], [0.72, 0.98]);
  const innerY = useTransform(scrollY, [0, 96], [0, -2]);
  const innerScale = useTransform(scrollY, [0, 96], [1, 0.985]);

  return (
    <LazyMotion features={domAnimation} strict>
      <header
        data-header-motion
        className="sticky inset-x-0 top-0 z-40 isolate border-b border-[color:var(--carnet-line)]"
      >
        <m.div
          data-header-surface
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[color:var(--carnet-canvas)] backdrop-blur-xl"
          style={{
            opacity: reduceMotion === true ? 0.98 : surfaceOpacity,
          }}
        />
        <m.div
          className="mx-auto flex h-18 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8"
          style={
            reduceMotion === false
              ? { y: innerY, scale: innerScale }
              : undefined
          }
        >
          {children}
        </m.div>
      </header>
    </LazyMotion>
  );
}
