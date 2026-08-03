"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moteur de mouvement de landing-v5, sur le même principe que
 * components/v2/reveal.tsx : un seul moteur (GSAP + ScrollTrigger +
 * Lenis), sans guard du mouvement réduit — décision produit
 * explicite du handoff, déjà précédentée sur /. Les sections qui ont
 * besoin de leur propre défilement scrubbé (masthead, specimen,
 * follow-up) ouvrent leur propre ScrollTrigger, comme
 * components/v2/masthead.tsx le fait déjà à côté de V2MotionRoot :
 * ScrollTrigger ne pose qu'un seul écouteur global quel que soit le
 * nombre de `ScrollTrigger.create` dans l'arbre.
 */

let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  pluginsReady = true;
}

export const EASE = "expo.out";

/** Hauteur du masthead, retranchée quand une ancre est visée. */
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
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((el) => {
            const delay = Number(el.getAttribute("data-delay") ?? 0) / 1000;
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
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

/**
 * Parallaxe scrubbée, un `ScrollTrigger` par instance — même principe
 * que `Drift` dans components/v2/reveal.tsx, mais avec le calcul exact
 * du prototype (translation proportionnelle à la distance du centre de
 * l'hôte au centre du viewport) plutôt qu'une interpolation start/end.
 */
export function Parallax({
  factor,
  className,
  children,
}: {
  factor: number;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const hostNode = host.current;
      const node = hostNode?.firstElementChild as HTMLElement | null;
      if (!hostNode || !node) return;

      const trigger = ScrollTrigger.create({
        trigger: hostNode,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          const rect = hostNode.getBoundingClientRect();
          const vh = window.innerHeight;
          const centre = rect.top + rect.height / 2 - vh / 2;
          gsap.set(node, { y: -centre * factor });
        },
      });

      return () => trigger.kill();
    },
    { scope: host, dependencies: [factor] },
  );

  return (
    <div ref={host} className={className}>
      <div className="h-full">{children}</div>
    </div>
  );
}
