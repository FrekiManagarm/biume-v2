"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moteur de mouvement de landing-v5 : un seul moteur (GSAP + ScrollTrigger
 * + Lenis), sans garde de mouvement réduit — décision produit explicite du
 * handoff. Les sections qui ont besoin de leur propre défilement scrubbé
 * ouvrent leur propre ScrollTrigger (ex. masthead) : ScrollTrigger ne pose
 * qu'un seul écouteur global quel que soit le nombre de
 * `ScrollTrigger.create` dans l'arbre.
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

      const selector = "[data-reveal]";
      gsap.set(selector, { autoAlpha: 0, y: 20 });

      ScrollTrigger.batch(selector, {
        start: "top 94%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((el) => {
            const delay = Number(el.getAttribute("data-delay") ?? 0) / 1000;
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: EASE,
              delay,
              overwrite: "auto",
            });
          });
        },
      });
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
