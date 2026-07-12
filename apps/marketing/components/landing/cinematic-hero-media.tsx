"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";

export type CinematicHeroMediaProps = {
  alt: string;
  desktop: { src: string; srcSet?: string; sizes?: string };
  mobile: { srcSet?: string };
};

export function CinematicHeroMedia({
  alt,
  desktop,
  mobile,
}: CinematicHeroMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        ref={frameRef}
        data-cinematic-hero-media="true"
        className="cinematic-hero-media"
      >
        <m.div
          className="cinematic-hero-media__depth"
          style={reduceMotion ? undefined : { y, scale }}
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={mobile.srcSet} />
            <img
              src={desktop.src}
              srcSet={desktop.srcSet}
              sizes={desktop.sizes}
              alt={alt}
              width={1122}
              height={1402}
              fetchPriority="high"
              className="cinematic-hero-media__image"
            />
          </picture>
        </m.div>
      </div>
    </LazyMotion>
  );
}
