"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";

/**
 * Scope de motion de la landing d'accueil.
 *
 * Un seul moteur par arbre : deux bibliothèques qui écrivent la même
 * propriété transformée sur un même nœud se remplacent l'une l'autre à
 * chaque frame. Tout passe donc par GSAP ici — plus de `motion/react`.
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

const EASE = "power3.out";

/**
 * Tout le mouvement est monté sous cette seule requête média.
 *
 * C'est le remplaçant direct du `reducedMotion="user"` de Framer : si
 * l'utilisateur demande moins de mouvement, `gsap.matchMedia` n'exécute
 * jamais le bloc, donc aucun état de départ n'est posé et la page
 * s'affiche complète et immobile. Même chose sans JavaScript.
 */
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Scope de motion pour la landing.
 * - entrées groupées par volée, une seule fois, jamais de boucle
 * - mouvement réduit : rendu final immédiat, sans animation
 */
export function V2MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Le hero est exclu : il orchestre sa propre ouverture, et deux
        // animations écriraient la même opacité sur les mêmes nœuds.
        const selector = "[data-reveal]:not([data-hero-item])";
        gsap.set(selector, { autoAlpha: 0, y: 24 });

        // Une volée rassemble tout ce qui franchit le seuil dans le même
        // intervalle et le libère en cascade. Une entrée isolée n'a pas
        // de rythme ; un groupe en a un.
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

  return <div ref={root}>{children}</div>;
}

/** Reveal d'entrée simple, joué par la volée posée à la racine. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal="" className={className}>
      {children}
    </div>
  );
}

/**
 * Orchestrateur du hero.
 *
 * Le `h1` présent dans l'arbre est découpé **par ligne**, chaque ligne
 * montant depuis sa propre gouttière. Le découpage n'est jamais fait par
 * caractère : cela casserait la sélection du texte et ferait vocaliser
 * le titre lettre à lettre. `autoSplit` refait la coupe quand la police
 * finit de charger ou que la largeur change.
 *
 * Le bloc qui contient le titre est retiré de la cascade des autres
 * items : sans cela, son opacité serait écrite deux fois.
 */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const scope = host.current;
        if (!scope) return;

        const title = scope.querySelector<HTMLElement>("h1");
        const titleHolder = title?.closest("[data-hero-item]");

        const items = gsap.utils
          .toArray<HTMLElement>("[data-hero-item]")
          .filter((item) => item !== titleHolder);

        gsap.set(items, { autoAlpha: 0, y: 22 });

        const tl = gsap.timeline();

        if (title) {
          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            // L'animation vit dans `onSplit` pour viser les lignes qui
            // viennent d'être créées, et elle est retournée pour que
            // SplitText la rejoue à l'identique après une recoupe.
            onSplit(self) {
              return tl.from(
                self.lines,
                { yPercent: 112, duration: 1.2, ease: EASE, stagger: 0.085 },
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

  return (
    <div ref={host} className={className}>
      {children}
    </div>
  );
}

/** Item de l'orchestration du hero. */
export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-hero-item="" className={className}>
      {children}
    </div>
  );
}

/**
 * Dérive lente d'un élément au scroll : il traverse moins de distance
 * que la page, ce qui lui donne une profondeur propre.
 *
 * C'est le retard du `scrub`, et non l'amplitude, qui produit la
 * douceur. Réservé au paysage du hero — le reste de la page ne bouge
 * pas au scroll.
 */
export function Drift({
  distance = 36,
  className,
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
