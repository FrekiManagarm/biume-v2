"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Toute l'animation de la v2 passe par GSAP. Un seul moteur par arbre :
 * deux bibliothèques qui écrivent la même propriété transformée sur un
 * même nœud se remplacent l'une l'autre à chaque frame.
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

const EASE = "power3.out";

/** Le mouvement n'est monté que sous cette requête. En dessous, aucun
 *  état de départ n'est posé — donc rien n'est masqué. */
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Racine `.lv2`.
 *
 * Les entrées de section sont groupées par `ScrollTrigger.batch` : tout
 * ce qui franchit le seuil dans le même intervalle est libéré en
 * cascade, ce qui donne un rythme commun plutôt qu'une montée isolée
 * par élément.
 *
 * `useGSAP` s'exécute dans un `useLayoutEffect`, donc l'état de départ
 * est posé avant la première peinture : rien ne clignote. Et comme il ne
 * l'est que sous `prefers-reduced-motion: no-preference`, la page reste
 * complète sans JavaScript comme en mouvement réduit.
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
        const selector = "[data-reveal]:not([data-hero])";
        gsap.set(selector, { autoAlpha: 0, y: 16 });

        ScrollTrigger.batch(selector, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: EASE,
              stagger: { each: 0.08, from: "start" },
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

/** Marque un bloc comme entrant. L'animation est jouée par la volée
 *  posée à la racine. */
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
 * Ouverture du hero : une timeline unique enchaîne le titre découpé par
 * lignes puis les blocs qui le suivent.
 *
 * Le découpage est par ligne avec un masque par ligne — jamais par
 * caractère, qui casserait la sélection du texte et se ferait vocaliser
 * lettre à lettre. `autoSplit` refait la coupe quand la police finit de
 * charger ou que la largeur change.
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
        gsap.set(items, { autoAlpha: 0, y: 18 });

        const tl = gsap.timeline();

        if (titleRef.current) {
          SplitText.create(titleRef.current, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return tl.from(
                self.lines,
                { yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.08 },
                0.1,
              );
            },
          });
        }

        tl.to(
          items,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.09 },
          0.4,
        );
      });

      return () => mm.revert();
    },
    { scope: host },
  );

  return <div ref={host}>{children}</div>;
}

/**
 * Parallaxe liée au scroll : le bloc traverse moins de distance que la
 * page. C'est le retard du `scrub`, pas l'amplitude, qui fait la
 * douceur.
 */
export function Parallax({
  distance = 40,
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
 * Pilote la transformation de l'atelier : renvoie l'index du palier
 * courant (0 → rien, 1-3 → champs renseignés, 4 → relu et validé).
 *
 * ScrollTrigger remplace ici la boucle `requestAnimationFrame` écrite à
 * la main : mêmes paliers, mais le calcul de position est mutualisé
 * avec le reste de la page au lieu d'ouvrir un second écouteur de
 * scroll, et l'horloge est celle de GSAP.
 *
 * La mécanique reste réservée aux écrans larges : en dessous, les deux
 * panneaux s'empilent et la démonstration se lit d'un coup, complète.
 */
export function useScrollBeats({
  trackRef,
  count,
}: {
  trackRef: React.RefObject<HTMLElement | null>;
  count: number;
}) {
  // La valeur de repos est le palier final : sans JavaScript, en
  // mouvement réduit ou sur écran étroit, la démonstration est rendue
  // complète. L'animation ne conditionne jamais la lecture.
  const [beat, setBeat] = useState(count);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const node = trackRef.current;
        if (!node) return;

        const toBeat = (progress: number) =>
          Math.min(count, Math.floor(progress * (count + 0.6)));

        const trigger = ScrollTrigger.create({
          trigger: node,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => setBeat(toBeat(self.progress)),
        });

        // `onUpdate` ne se déclenche qu'au premier mouvement : on cale
        // l'état de départ sur la position réelle, sinon la section
        // s'affiche validée avant même d'avoir été parcourue.
        setBeat(toBeat(trigger.progress));

        return () => {
          trigger.kill();
          setBeat(count);
        };
      });

      return () => mm.revert();
    },
    { dependencies: [count] },
  );

  return beat;
}
