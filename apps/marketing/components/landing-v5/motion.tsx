"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moteur de mouvement de landing-v5 : Lenis pour le scroll doux, GSAP pour
 * les tweens, sans garde de mouvement réduit — décision produit explicite
 * du handoff. Les apparitions au scroll (`Reveal`) passent par un
 * IntersectionObserver plutôt que `ScrollTrigger.batch` : son callback se
 * déclenche toujours dès `observe()` avec l'état réel du moment, y compris
 * pour un élément déjà visible au chargement, sans dépendre d'un premier
 * évènement de scroll. Les sections qui ont besoin de leur propre
 * défilement passent par leur propre `ScrollTrigger` (ex. masthead).
 */

let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  pluginsReady = true;
}

export const EASE = "expo.out";

const ANCHOR_OFFSET = -72;

export function LandingV5MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: ANCHOR_OFFSET, duration: 1.3 });
      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(1000, 33);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      ensureGsapPlugins();

      const nodes = root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!nodes || nodes.length === 0) return;

      gsap.set(nodes, { autoAlpha: 0, y: 20 });

      // IntersectionObserver plutôt que ScrollTrigger.batch : son callback
      // se déclenche toujours une première fois dès `observe()`, avec l'état
      // d'intersection réel du moment — y compris pour un élément déjà
      // visible au chargement (tout le haut de page, hero compris), sans
      // dépendre d'un premier évènement de scroll pour être évalué.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            const delay = Number(el.getAttribute("data-delay") ?? 0) / 1000;
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: EASE,
              delay,
              overwrite: "auto",
            });
            observer.unobserve(el);
          }
        },
        { threshold: 0, rootMargin: "0px 0px -6% 0px" },
      );

      nodes.forEach((node) => observer.observe(node));

      return () => observer.disconnect();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}

/** Apparition simple, jouée par la volée posée à la racine. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div data-reveal="" data-delay={delay} className={className}>
      {children}
    </div>
  );
}
