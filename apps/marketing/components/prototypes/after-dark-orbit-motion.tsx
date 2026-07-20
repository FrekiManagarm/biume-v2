"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;
const orbitSpring = { stiffness: 150, damping: 24, mass: 0.45 };

const documents = [
  {
    label: "Ce que vous observez",
    body: "Tension dorsale plus souple après relâchement. Appui à surveiller sur les départs.",
  },
  {
    label: "Ce que Biume organise",
    body: "Les observations deviennent un résumé fidèle, prêt à être relu par vous.",
  },
  {
    label: "Ce que le propriétaire garde",
    body: "Deux jours plus calmes. Reprendre contact si la démarche change ou inquiète.",
  },
] as const;

const documentInsets = ["inset-x-0", "inset-x-[5%]", "inset-x-[10%]"] as const;

type CaseRelayItem = {
  title: string;
  body: string;
};

export function OrbitTrajectory({
  stages,
  children,
}: {
  stages: readonly string[];
  children: ReactNode;
}) {
  const target = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 80%", "end 35%"],
  });
  const pathLength = useSpring(scrollYProgress, orbitSpring);

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={target}
        data-orbit-trajectory="true"
        className="relative overflow-clip"
      >
        <m.svg
          aria-hidden="true"
          viewBox="0 0 1000 320"
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-full w-full md:block"
        >
          <m.path
            d="M0 235 C164 54 316 307 510 142 S770 34 1000 198"
            fill="none"
            stroke="#ef9b70"
            strokeWidth="1.5"
            style={{ pathLength }}
          />
        </m.svg>
        <ol className="relative grid gap-3 md:grid-cols-4 md:gap-0">
          {stages.map((stage, index) => (
            <m.li
              key={stage}
              initial={{ opacity: 0.18 }}
              whileInView={{ x: index % 2 ? 20 : -20, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: easeOut }}
              className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#ef9b70]"
            >
              {stage}
            </m.li>
          ))}
        </ol>
        {children}
      </section>
    </LazyMotion>
  );
}

export function OrbitHeroMedia({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        ref={target}
        data-orbit-hero="true"
        className={className}
        style={{ y, scale }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function OrbitDocumentStack() {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 82%", "end 28%"],
  });
  const firstY = useTransform(scrollYProgress, [0, 1], [46, -20]);
  const secondY = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const thirdY = useTransform(scrollYProgress, [0, 1], [-24, 20]);
  const firstRotate = useTransform(scrollYProgress, [0, 1], [-3, 1.5]);
  const thirdRotate = useTransform(scrollYProgress, [0, 1], [3, -1.5]);
  const offsets = [firstY, secondY, thirdY] as const;

  return (
    <LazyMotion features={domAnimation} strict>
      <section ref={target} data-orbit-documents="true" className="relative">
        <div className="grid gap-4 md:hidden">
          {documents.map((document, index) => (
            <article key={document.label} className="border border-white/15 p-6">
              <p className="text-sm font-semibold">{document.label}</p>
              <p className="mt-6 max-w-[34ch] text-lg leading-7 text-white/70">
                {document.body}
              </p>
              <span className="mt-8 block font-mono text-xs tracking-[0.16em] text-[#ef9b70]">
                0{index + 1}
              </span>
            </article>
          ))}
        </div>
        <div className="relative hidden min-h-[27rem] md:block">
          {documents.map((document, index) => (
            <m.article
              key={document.label}
              layout
              style={{
                y: offsets[index],
                rotate:
                  index === 0 ? firstRotate : index === 2 ? thirdRotate : 0,
              }}
              className={`absolute ${documentInsets[index]} border border-white/15 p-7 ${
                index === 1
                  ? "z-[2] bg-[#e48c65] text-[#192023]"
                  : "bg-[#18282a] text-[#f5f3eb]"
              }`}
            >
              <p className="text-sm font-semibold">{document.label}</p>
              <p
                className={`mt-10 max-w-[31ch] text-xl leading-8 ${
                  index === 1 ? "text-current/75" : "text-white/70"
                }`}
              >
                {document.body}
              </p>
              <span className="absolute bottom-7 right-7 font-mono text-xs tracking-[0.16em] opacity-55">
                0{index + 1}
              </span>
            </m.article>
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}

export function OrbitCaseRelay({ items }: { items: readonly CaseRelayItem[] }) {
  const target = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 82%", "end 28%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [32, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.28, 1], [0.42, 1, 1]);

  return (
    <LazyMotion features={domAnimation} strict>
      <section ref={target} data-orbit-cases="true">
        <div className="divide-y border-y border-white/15 md:hidden">
          {items.map((item, index) => (
            <article key={item.title} className="py-7">
              <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[#ef9b70]">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[48ch] leading-7 text-white/70">{item.body}</p>
            </article>
          ))}
        </div>
        <m.div style={{ y, opacity }} className="hidden divide-y border-y border-white/15 md:block">
          {items.map((item, index) => (
            <m.article
              key={item.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: easeOut }}
              className="grid gap-4 py-8 md:grid-cols-[5rem_minmax(12rem,0.55fr)_1fr] md:items-start"
            >
              <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[#ef9b70]">
                0{index + 1}
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="max-w-[48ch] leading-7 text-white/70">{item.body}</p>
            </m.article>
          ))}
        </m.div>
      </section>
    </LazyMotion>
  );
}
