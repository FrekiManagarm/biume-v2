"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";

const spring = { stiffness: 180, damping: 20, mass: 0.35 };
const easeOut = [0.16, 1, 0.3, 1] as const;

export function MagneticLink({
  href,
  children,
  className,
  dataConversion,
}: {
  href: string;
  children: ReactNode;
  className: string;
  dataConversion?: string;
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);

  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
    rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
  }

  function reset() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.a
        href={href}
        data-conversion={dataConversion}
        className={className}
        style={{ x, y }}
        onPointerMove={move}
        onPointerLeave={reset}
        onBlur={reset}
      >
        {children}
      </m.a>
    </LazyMotion>
  );
}

export function TransitRail({ tone = "light" }: { tone?: "light" | "night" }) {
  const words = ["observer", "rendre lisible", "rester présent"];
  const content = [...words, ...words, ...words];

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        aria-hidden="true"
        className={`overflow-hidden border-y py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
          tone === "light"
            ? "border-[#16322e]/20 text-[#176a5a]"
            : "border-[#ef9b70]/35 text-[#ef9b70]"
        }`}
      >
        <m.div
          className="flex w-max gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 21, repeat: Infinity, ease: "linear" }}
        >
          {content.map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center gap-8">
              {word}
              <span className="size-1.5 rounded-full bg-current" />
            </span>
          ))}
        </m.div>
      </div>
    </LazyMotion>
  );
}

export function ParallaxMedia({
  children,
  className,
  distance = 7,
}: {
  children: ReactNode;
  className: string;
  distance?: number;
}) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${distance}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.07, 1]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div ref={target} className={className} style={{ y, scale }}>
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function TransitDocuments({ tone }: { tone: "light" | "night" }) {
  const stages = [
    { label: "Ce que vous observez", body: "Tension dorsale plus souple après relâchement. Appui à surveiller sur les départs.", offset: -18 },
    { label: "Ce que Biume organise", body: "Les observations deviennent un résumé fidèle, prêt à être relu par vous.", offset: 0 },
    { label: "Ce que le propriétaire garde", body: "Deux jours plus calmes. Reprendre contact si la démarche change ou inquiète.", offset: 18 },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative grid gap-4 md:grid-cols-3 md:gap-0">
        {stages.map((stage, index) => (
          <m.article
            key={stage.label}
            initial={false}
            whileInView={{ y: stage.offset, rotate: (index - 1) * 1.2 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.56, delay: index * 0.08, ease: easeOut }}
            className={`relative min-h-64 border p-6 md:min-h-72 md:p-7 ${
              tone === "light"
                ? index === 1
                  ? "z-10 bg-[#d8e9df] text-[#16322e]"
                  : "bg-[#f4f6f1] text-[#16322e]"
                : index === 1
                  ? "z-10 bg-[#e48c65] text-[#192023]"
                  : "bg-[#18282a] text-[#f5f3eb]"
            }`}
          >
            <p className="text-sm font-semibold">{stage.label}</p>
            <p className={`mt-8 max-w-[24ch] text-lg leading-7 ${tone === "light" || index === 1 ? "text-current/75" : "text-white/70"}`}>
              {stage.body}
            </p>
            <span className="absolute bottom-6 right-6 font-mono text-xs opacity-55">0{index + 1}</span>
          </m.article>
        ))}
      </div>
    </LazyMotion>
  );
}

export function ContinuityPath() {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.svg aria-hidden="true" viewBox="0 0 1000 180" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full text-[#ef9b70] md:h-36">
        <m.path
          d="M0 124 C154 18 296 186 438 82 S702 20 804 105 S936 145 1000 54"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 1.2, ease: easeOut }}
        />
      </m.svg>
    </LazyMotion>
  );
}
