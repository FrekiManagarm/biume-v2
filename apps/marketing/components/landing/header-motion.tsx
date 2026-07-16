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
  const y = useTransform(scrollY, [0, 120], [0, -3]);
  const scale = useTransform(scrollY, [0, 120], [1, 0.985]);
  const surfaceOpacity = useTransform(scrollY, [0, 120], [0.92, 0.98]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.header
        data-header-motion
        className="sticky inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
        style={reduceMotion ? undefined : { y, scale }}
      >
        <m.div
          data-header-surface
          aria-hidden="true"
          className="absolute inset-3 -z-10 rounded-[1.25rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_18px_45px_-35px_rgba(107,90,200,0.35)] backdrop-blur-xl"
          style={{ opacity: reduceMotion ? 0.98 : surfaceOpacity }}
        />
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-5">
          {children}
        </div>
      </m.header>
    </LazyMotion>
  );
}
