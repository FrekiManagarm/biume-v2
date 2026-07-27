"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scope de motion de la landing d'accueil.
 *
 * Un seul moteur par arbre : deux bibliothèques qui écrivent la même
 * propriété transformée sur un même nœud se remplacent l'une l'autre à
 * chaque frame. Tout passe donc par GSAP ici — plus de `motion/react`.
 *
 * Les gardes d'accessibilité liées au mouvement réduit sont délibérément
 * **écartées** de cette landing, sur demande explicite et répétée, après
 * que la conséquence a été signalée : les personnes sujettes au mal des
 * transports subiront la page en plein mouvement. Ne pas réintroduire la
 * garde sans redemander.
 *
 * Ce qui reste, et qui ne relève pas du mouvement réduit mais de la robustesse :
 * aucun état de départ n'est posé en CSS. Si le script échoue, la page
 * est complète et lisible — `/` est indexée.
 */

/**
 * `registerPlugin` touche `requestAnimationFrame` dès l'appel. Le faire
 * au chargement du module casserait le rendu serveur, et tout
 * environnement DOM partiel avec lui. L'enregistrement se fait donc à la
 * première exécution d'un effet, qui ne tourne que dans un vrai
 * navigateur. Idempotent, appelé en tête de chaque `useGSAP`.
 */
let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  pluginsReady = true;
}

/** L'ease de la maison : sortie franche, pose longue. */
export const EASE = "power3.out";

/** Au-dessus, les gestes lourds — pinning, Flip. En dessous, le même
 *  récit sans capture du scroll. */
export const WIDE = "(min-width: 1024px)";

/** Hauteur du masthead, retranchée quand une ancre est visée. */
const ANCHOR_OFFSET = -88;

export function V2MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    // Lenis anime le scroll natif de la fenêtre plutôt que de translater
    // un conteneur : `position: sticky` et le pinning de ScrollTrigger
    // restent intacts. ScrollSmoother ferait l'inverse.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Le tactile garde son inertie système : la surcharger donne une
      // sensation de latence sur mobile, jamais de douceur.
      touchMultiplier: 1.6,
    });

    // Sans cet accrochage, les deux horloges dérivent et les
    // déclenchements arrivent avec un cran de retard.
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Les ancres passent par Lenis : un saut natif entrerait en conflit
    // avec l'amortissement et la page tremblerait en fin de course.
    // `scroll-mt-*` ne s'applique pas non plus, d'où l'offset explicite.
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
      // Une cible non focusable ignorerait `focus()` en silence : seul
      // le lien d'évitement, qui porte `tabindex="-1"`, déplace vraiment
      // le focus. Pour les autres ancres, seule la vue se déplace.
      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
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
      ensureGsapPlugins();

      // Le hero orchestre sa propre ouverture : l'exclure, sinon deux
      // animations écriraient la même opacité sur les mêmes nœuds.
      const selector = "[data-reveal]:not([data-hero-item])";
      gsap.set(selector, { autoAlpha: 0, y: 24 });

      // Une volée rassemble tout ce qui franchit le seuil dans le même
      // intervalle et le libère en cascade. Une entrée isolée n'a pas de
      // rythme ; un groupe en a un.
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
 * Titre découpé par lignes, chaque ligne montant depuis sa propre
 * gouttière au franchissement du seuil.
 *
 * Jamais par caractère : un titre éclaté en lettres casse la sélection
 * du texte et se fait vocaliser lettre à lettre. `autoSplit` refait la
 * coupe quand la police finit de charger ou que la largeur change —
 * sans lui, les lignes se figent sur les métriques de la police de
 * secours.
 */
export function CutLines({
  as: Tag = "div",
  id,
  className,
  children,
}: {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const node = host.current;
      if (!node) return;

      SplitText.create(node, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          // L'animation vit dans `onSplit` pour viser les lignes qui
          // viennent d'être créées, et elle est retournée pour que
          // SplitText la rejoue à l'identique après une recoupe.
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.15,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: node, start: "top 86%", once: true },
          });
        },
      });
    },
    { scope: host },
  );

  return (
    <Tag ref={host} id={id} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Orchestrateur du hero : le titre découpé par lignes, puis les blocs
 * qui le suivent, sur une timeline unique jouée au chargement.
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
 * Dérive lente au scroll : l'élément traverse moins de distance que la
 * page, ce qui lui donne une profondeur propre. C'est le retard du
 * `scrub`, et non l'amplitude, qui produit la douceur.
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
    },
    { scope: host, dependencies: [distance] },
  );

  return (
    <div ref={host} className={className}>
      <div>{children}</div>
    </div>
  );
}
