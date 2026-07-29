"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Toute l'animation de la v4 passe par GSAP. Pas de Framer Motion dans
 * cet arbre : deux moteurs qui se disputent les mêmes propriétés
 * transformées finissent toujours par se marcher dessus.
 *
 * L'enregistrement est fait au chargement du module, une seule fois,
 * jamais dans le corps d'un composant qui se re-rend.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

gsap.defaults({ ease: "power3.out", duration: 0.9 });

/** L'ease de la maison. Sortie franche puis pose longue : la page
 *  arrive vite et se stabilise, au lieu de flotter. */
const EASE = "power3.out";

/**
 * Racine `.lv4`. Deux choses s'y jouent.
 *
 *  1. Lenis pilote le défilement amorti. Il anime le scroll natif de
 *     la fenêtre plutôt que de translater un conteneur, ce qui laisse
 *     `position: sticky` intact — le relevé en dépend entièrement.
 *     ScrollTrigger est branché sur ses mises à jour et sur le ticker
 *     GSAP, sinon les deux horloges dérivent et les déclenchements
 *     arrivent avec un cran de retard.
 *
 *  2. Les entrées de section sont groupées par `ScrollTrigger.batch`,
 *     qui rassemble tout ce qui franchit le seuil dans le même
 *     intervalle et le libère en cascade. Une entrée isolée n'a pas
 *     de rythme ; une volée en a un.
 *
 * Aucun drapeau « monté » n'est nécessaire : `useGSAP` s'exécute dans
 * un `useLayoutEffect`, donc l'état de départ est posé avant la
 * première peinture. Le rendu serveur, lui, ne masque rien — sans
 * JavaScript la page est complète et immobile.
 */
export function MotionRoot({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Le tactile garde son inertie système : la surcharger donne une
      // sensation de latence sur mobile, jamais de douceur.
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Les ancres passent par Lenis : un `scrollIntoView` natif entrerait
    // en conflit avec l'amortissement et la page tremblerait en fin de
    // course.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      // L'état de départ est posé ici, pas en CSS : `useGSAP` s'exécute
      // dans un `useLayoutEffect`, donc avant la première peinture. Rien
      // ne clignote, et si le script ne tourne pas, rien n'est masqué.
      gsap.set("[data-reveal]:not([data-hero])", { autoAlpha: 0, y: 12 });

      // Le hero orchestre sa propre ouverture : il est exclu de la
      // volée, sinon deux animations écriraient la même opacité.
      ScrollTrigger.batch("[data-reveal]:not([data-hero])", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: EASE,
            stagger: { each: 0.08, from: "start" },
            overwrite: "auto",
          }),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

/**
 * Marque un bloc comme entrant. L'animation elle-même est jouée par la
 * volée posée à la racine : c'est ce qui donne aux sections un rythme
 * commun plutôt qu'une montée isolée par élément.
 */
export function Reveal({
  as: Tag = "div",
  hero = false,
  className = "",
  children,
}: {
  as?: ElementType;
  /** Réservé aux blocs du hero, orchestrés par leur propre timeline. */
  hero?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-reveal="" data-hero={hero ? "" : undefined} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Titre du hero. `SplitText` découpe le bloc **par lignes** et pose
 * lui-même un masque sur chacune : chaque ligne monte alors depuis sa
 * propre gouttière.
 *
 * Le découpage est par ligne, jamais par caractère : un titre éclaté
 * en lettres casse la sélection du texte et se fait vocaliser
 * caractère par caractère. `autoSplit` refait la coupe quand les
 * polices finissent de charger ou quand la largeur change — sans lui,
 * les lignes se figent sur les métriques de la police de secours.
 */
export function CutReveal({
  lines,
  className = "",
  id,
}: {
  lines: readonly string[];
  className?: string;
  id?: string;
}) {
  const host = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const node = host.current;
      if (!node) return;

      SplitText.create(node, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "lv4-line",
        // L'animation vit dans `onSplit` pour viser les lignes qui
        // viennent d'être créées, et elle est retournée pour que
        // SplitText la reprenne à l'identique après une recoupe.
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 108,
            duration: 1.25,
            ease: EASE,
            stagger: 0.09,
            delay: 0.15,
          });
        },
      });
    },
    { scope: host },
  );

  return (
    <span ref={host} id={id} className={className}>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

/**
 * Parallaxe liée au scroll. Le bloc traverse moins de distance que la
 * page, ce qui lui donne une profondeur propre dans le volume.
 *
 * `scrub` avec une valeur numérique laisse la tête de lecture
 * rattraper le scroll en un peu moins d'un tiers de seconde : c'est ce
 * retard, et non l'amplitude, qui fait la douceur.
 */
export function Parallax({
  distance = 60,
  className = "",
  children,
}: {
  distance?: number;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const node = host.current?.firstElementChild;
      if (!node) return;

      gsap.fromTo(
        node,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: host.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
          },
        },
      );
    },
    { scope: host, dependencies: [distance] },
  );

  return (
    <div ref={host} className={className}>
      <div>{children}</div>
    </div>
  );
}

/**
 * Action magnétique : le bouton s'incline vers le curseur, puis revient
 * par ressort.
 *
 * `quickTo` écrit directement dans le moteur, hors du cycle de rendu
 * React — un `useState` sur la position du curseur relancerait un
 * rendu à chaque frame et effondrerait la page. Les écouteurs passent
 * par `contextSafe` pour être révoqués avec le contexte.
 */
export function Magnetic({
  strength = 0.32,
  className = "",
  children,
}: {
  strength?: number;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      const node = host.current;
      if (!node || !contextSafe) return;

      const setX = gsap.quickTo(node, "x", { duration: 0.5, ease: "power3" });
      const setY = gsap.quickTo(node, "y", { duration: 0.5, ease: "power3" });

      const onMove = contextSafe((event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = node.getBoundingClientRect();
        setX((event.clientX - (rect.left + rect.width / 2)) * strength);
        setY((event.clientY - (rect.top + rect.height / 2)) * strength);
      }) as (event: PointerEvent) => void;

      const onLeave = contextSafe(() => {
        setX(0);
        setY(0);
      }) as () => void;

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);

      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: host, dependencies: [strength] },
  );

  return (
    <span ref={host} className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}

/**
 * Surface qui prend la lumière sous le curseur. La position part
 * directement dans deux propriétés personnalisées de l'élément : aucun
 * état React, donc aucun rendu par frame.
 */
export function Lit({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      const node = host.current;
      if (!node || !contextSafe) return;

      const onMove = contextSafe((event: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        gsap.set(node, {
          "--lv4-mx": `${((event.clientX - rect.left) / rect.width) * 100}%`,
          "--lv4-my": `${((event.clientY - rect.top) / rect.height) * 100}%`,
        });
      }) as (event: PointerEvent) => void;

      node.addEventListener("pointermove", onMove);
      return () => node.removeEventListener("pointermove", onMove);
    },
    { scope: host },
  );

  return (
    <div ref={host} className={`lv4-lit ${className}`}>
      {children}
    </div>
  );
}
