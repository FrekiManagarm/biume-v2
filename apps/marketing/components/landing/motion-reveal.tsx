"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";

const subscribeToHydration = () => () => {};

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  amount = 0.28,
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduceMotion = useReducedMotion();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const isVisible = !isHydrated || reduceMotion || isInView;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        ref={ref}
        className={className}
        initial={false}
        animate={
          isVisible
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 28 }
        }
        transition={{
          duration: 0.64,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
