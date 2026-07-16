"use client";

import Image from "next/image";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { memo } from "react";

const systemDocuments = [
  { label: "Note de séance", drift: -8, rotation: -0.7 },
  { label: "Compte rendu clair", drift: -10, rotation: 0.6 },
  { label: "Suivi planifié", drift: -7, rotation: 0.8 },
] as const;

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
      {systemDocuments.map((document, index) => (
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
        initial={false}
        animate={{ rotate: 360 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          repeat: Infinity,
          repeatDelay: 0.8,
        }}
      />
      {systemDocuments.map((document, index) => (
        <m.article
          key={document.label}
          data-system-document
          data-system-index={index}
          className="living-system-document"
          initial={false}
          animate={{ y: document.drift, rotate: document.rotation }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.18,
          }}
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
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
      </div>
      <LazyMotion features={domAnimation}>
        <SystemElements reduceMotion={reduceMotion} />
      </LazyMotion>
    </div>
  );
});
