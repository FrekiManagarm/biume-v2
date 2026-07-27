"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ElementType, type ReactNode } from "react";

/**
 * Toute l'animation de la v3 passe par GSAP. Un seul moteur par arbre :
 * deux bibliothèques qui écrivent la même propriété transformée sur un
 * même nœud se remplacent l'une l'autre à chaque frame.
 *
 * L'enregistrement se fait au chargement du module, une seule fois,
 * jamais dans le corps d'un composant qui se re-rend.
 */
/**
 * `ScrollTrigger.register` touche `requestAnimationFrame` dès
 * l'enregistrement. Le faire au chargement du module casserait le rendu
 * serveur, et tout environnement DOM partiel avec lui.
 *
 * L'enregistrement se fait donc à la première exécution d'un effet, qui
 * ne tourne que dans un vrai navigateur. Idempotent, appelé en tête de
 * chaque `useGSAP`.
 */
let pluginsReady = false;

function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  pluginsReady = true;
}

/** Sortie exponentielle : la page arrive vite puis se pose. */
const EASE = "power3.out";

/** Le mouvement complet n'est monté que sous cette requête. En dessous,
 *  aucun état de départ n'est posé — donc rien n'est masqué. */
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Racine `.lv3`.
 *
 * Les entrées de section sont groupées par `ScrollTrigger.batch` : tout
 * ce qui franchit le seuil dans le même intervalle est libéré en
 * cascade. Une entrée isolée n'a pas de rythme, une volée en a un.
 *
 * Aucun drapeau « monté » n'est nécessaire : `useGSAP` s'exécute dans un
 * `useLayoutEffect`, donc l'état de départ est posé avant la première
 * peinture. Sans JavaScript, ou en mouvement réduit, rien n'est masqué
 * et la page est complète.
 */
export function MotionRoot({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Le hero est exclu de la volée : il orchestre sa propre
        // ouverture, et deux animations écriraient la même opacité.
        const selector = "[data-reveal]:not([data-hero])";
        gsap.set(selector, { autoAlpha: 0, y: 14 });

        ScrollTrigger.batch(selector, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: EASE,
              stagger: { each: 0.07, from: "start" },
              overwrite: "auto",
            }),
        });
      });

      return () => mm.revert();
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
 * Marque un bloc comme entrant. L'animation est jouée par la volée posée
 * à la racine : c'est elle qui donne aux sections un rythme commun
 * plutôt qu'une montée isolée par élément.
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
 * Ouverture du hero : une timeline unique enchaîne le titre puis les
 * blocs qui le suivent, au lieu de délais posés à la main sur chaque
 * élément.
 *
 * Le titre est découpé **par ligne** avec un masque par ligne, jamais
 * par caractère : un titre éclaté en lettres casse la sélection du texte
 * et se fait vocaliser lettre à lettre. `autoSplit` refait la coupe
 * quand les polices finissent de charger ou que la largeur change —
 * sans lui, les lignes se figent sur les métriques de la police de
 * secours.
 */
export function HeroOrchestration({
  titleRef,
  children,
}: {
  titleRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-hero]");
        gsap.set(items, { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline();

        if (titleRef.current) {
          SplitText.create(titleRef.current, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return tl.from(
                self.lines,
                {
                  yPercent: 110,
                  duration: 1.15,
                  ease: EASE,
                  stagger: 0.085,
                },
                0.1,
              );
            },
          });
        }

        tl.to(
          items,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: EASE,
            stagger: 0.09,
          },
          0.45,
        );
      });

      return () => mm.revert();
    },
    { scope: host },
  );

  return <div ref={host}>{children}</div>;
}

/**
 * Parallaxe liée au scroll. Le bloc traverse moins de distance que la
 * page, ce qui lui donne une profondeur propre.
 *
 * `scrub` numérique laisse la tête de lecture rattraper le scroll en un
 * peu moins d'une demi-seconde : c'est ce retard, et non l'amplitude,
 * qui produit la douceur.
 */
export function Parallax({
  distance = 48,
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
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
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
              scrub: 0.4,
            },
          },
        );
      });

      return () => mm.revert();
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
 * Le manifeste : le texte devient lisible à mesure qu'on le traverse.
 *
 * L'avancement part dans une seule propriété personnalisée du conteneur,
 * `--lv3-read`, dont chaque mot dérive son encre en CSS. Un seul style
 * muté par frame, aucun rendu React, quel que soit le nombre de mots.
 *
 * `--lv3-read` est déclarée en `@property` avec `initial-value: 1` :
 * sans JavaScript ou en mouvement réduit, le texte est déjà lu.
 */
export function ScrollRead({
  text,
  className = "",
  id,
}: {
  text: string;
  className?: string;
  id?: string;
}) {
  const host = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const node = host.current;
        if (!node) return;

        const progress = { value: 0 };

        gsap.to(progress, {
          value: 1,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            // La lecture commence quand le bloc atteint le bas du
            // premier tiers et s'achève avant qu'il ne sorte par le
            // haut : le texte est entièrement lu pendant qu'on le voit.
            start: "top 78%",
            end: "bottom 52%",
            scrub: 0.35,
          },
          onUpdate: () =>
            node.style.setProperty("--lv3-read", progress.value.toFixed(4)),
        });

        return () => node.style.removeProperty("--lv3-read");
      });

      return () => mm.revert();
    },
    { scope: host },
  );

  return (
    <p ref={host} id={id} className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="lv3-word"
          style={{ "--i": (index / words.length).toFixed(4) } as never}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
