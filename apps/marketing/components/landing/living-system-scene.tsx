"use client";

import Image from "next/image";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { memo } from "react";

const springTransition = Object.freeze({
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  repeat: Infinity,
});

export const LIVING_SYSTEM_ORBIT_MOTION = Object.freeze({
  initial: Object.freeze({ rotate: -7 }),
  animate: Object.freeze({ rotate: Object.freeze([-7, 353]) }),
  transition: Object.freeze({
    ...springTransition,
    repeatDelay: 0.8,
  }),
});

function createDocumentMotion(
  label: string,
  baseRotation: number,
  drift: number,
  rotationDelta: number,
  delay: number,
) {
  return Object.freeze({
    label,
    initial: Object.freeze({ y: 0, rotate: baseRotation }),
    animate: Object.freeze({
      y: drift,
      rotate: baseRotation + rotationDelta,
    }),
    transition: Object.freeze({
      ...springTransition,
      repeatType: "reverse" as const,
      delay,
    }),
  });
}

export const LIVING_SYSTEM_DOCUMENT_MOTIONS = Object.freeze([
  createDocumentMotion("Note de séance", -2, -8, -0.7, 0),
  createDocumentMotion("Compte rendu clair", 1.2, -10, 0.6, 0.18),
  createDocumentMotion("Suivi planifié", 2, -7, 0.8, 0.36),
]);

function DocumentContent({ label }: { label: string }) {
  return (
    <>
      <span className="living-system-document-kicker">Biume</span>
      <strong>{label}</strong>
      <span aria-hidden="true" className="living-system-document-lines">
        <i />
        <i />
        <i />
      </span>
    </>
  );
}

function StaticSystemElements() {
  return (
    <>
      <div
        data-system-orbit
        aria-hidden="true"
        className="living-system-orbit"
      />
      {LIVING_SYSTEM_DOCUMENT_MOTIONS.map((document, index) => (
        <article
          key={document.label}
          data-system-document
          data-system-index={index}
          className="living-system-document"
        >
          <DocumentContent label={document.label} />
        </article>
      ))}
    </>
  );
}

const AnimatedSystemElements = memo(function AnimatedSystemElements() {
  return (
    <>
      <m.div
        data-system-orbit
        aria-hidden="true"
        className="living-system-orbit"
        initial={{ rotate: LIVING_SYSTEM_ORBIT_MOTION.initial.rotate }}
        animate={{
          rotate: [...LIVING_SYSTEM_ORBIT_MOTION.animate.rotate],
        }}
        transition={LIVING_SYSTEM_ORBIT_MOTION.transition}
      />
      {LIVING_SYSTEM_DOCUMENT_MOTIONS.map((document, index) => (
        <m.article
          key={document.label}
          data-system-document
          data-system-index={index}
          className="living-system-document"
          initial={{
            y: document.initial.y,
            rotate: document.initial.rotate,
          }}
          animate={{
            y: document.animate.y,
            rotate: document.animate.rotate,
          }}
          transition={document.transition}
        >
          <DocumentContent label={document.label} />
        </m.article>
      ))}
    </>
  );
});

function SystemElements({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) {
    return <StaticSystemElements />;
  }

  return <AnimatedSystemElements />;
}

export const LivingSystemScene = memo(function LivingSystemScene() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      data-living-system-scene
      className="living-system-scene min-h-[23rem] bg-[color:var(--carnet-blue-soft)] sm:min-h-[30rem] lg:min-h-[34rem]"
    >
      <div className="living-system-photo">
        <Image
          src="/assets/images/landing/hero-practitioner-horse.png"
          alt="Une ostéopathe animalière observe un cheval pendant une séance"
          fill
          priority
          fetchPriority="high"
          quality={65}
          sizes="(min-width: 1504px) 1408px, (min-width: 1024px) calc(100vw - 96px), (min-width: 640px) calc(100vw - 80px), calc(100vw - 53px)"
          className="object-cover"
        />
      </div>
      <LazyMotion features={domAnimation}>
        <SystemElements reduceMotion={reduceMotion} />
      </LazyMotion>
    </div>
  );
});
