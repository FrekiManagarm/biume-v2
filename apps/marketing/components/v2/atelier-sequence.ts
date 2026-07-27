"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

import { EASE, WIDE, ensureGsapPlugins } from "./reveal";

/**
 * La mécanique de l'atelier : quatre temps, un vol par fragment.
 *
 * Elle ne connaît du balisage que ses attributs de données. Le balisage,
 * lui, ne connaît rien d'elle et rend l'état final : c'est cette
 * séparation qui garantit qu'une page sans JavaScript reste une
 * démonstration lisible.
 *
 * 0 → note complète, compte rendu vide
 * 1-3 → un fragment vole vers son champ
 * 4 → le sceau se trace, le bloc propriétaire se pose
 */
const LAST_BEAT = 4;

let sequencePluginsReady = false;

function ensureSequencePlugins() {
  ensureGsapPlugins();
  if (sequencePluginsReady) return;
  gsap.registerPlugin(Flip, DrawSVGPlugin);
  sequencePluginsReady = true;
}

export function useAtelierSequence(
  rootRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      ensureSequencePlugins();
      const mm = gsap.matchMedia();

      mm.add(WIDE, () => {
        const root = rootRef.current;
        const track = trackRef.current;
        if (!root || !track) return;

        const q = gsap.utils.selector(root);
        const fragments = q("[data-fragment]") as HTMLElement[];
        const slots = q("[data-slot]") as HTMLElement[];
        const values = q("[data-value]") as HTMLElement[];
        const nodes = q("[data-rail-node]") as unknown as SVGCircleElement[];
        const progress = q("[data-rail-progress]")[0] as unknown as SVGLineElement;
        const seal = q("[data-seal]")[0] as HTMLElement;
        const sealCheck = q("[data-seal-check]")[0] as unknown as SVGPathElement;
        const owner = q("[data-owner]")[0] as HTMLElement;
        const pending = q("[data-pending]")[0] as HTMLElement;

        // Chaque valeur est découpée par mots une fois pour toutes : la
        // révélation se joue ensuite sur des nœuds stables.
        const splits = values.map((value) =>
          SplitText.create(value, { type: "words", wordsClass: "v2-word" }),
        );

        /** Repose l'état d'un temps sans l'animer. Sert au montage et à
         *  toute remontée : rejouer une timeline à l'envers pendant que
         *  le lecteur remonte donne le mal de mer. */
        const settle = (beat: number) => {
          gsap.killTweensOf([
            ...values,
            ...splits.flatMap((split) => split.words),
            ...nodes,
            progress,
            seal,
            owner,
            pending,
            ...fragments,
          ]);
          root.querySelectorAll("[data-flyer]").forEach((node) => node.remove());

          fragments.forEach((fragment, index) => {
            gsap.set(fragment, {
              backgroundColor:
                beat === index + 1 ? "var(--v2-mark)" : "transparent",
              color:
                beat > index ? "var(--v2-ink)" : "var(--v2-ink-soft)",
            });
          });

          splits.forEach((split, index) => {
            gsap.set(split.words, { autoAlpha: beat > index ? 1 : 0 });
          });

          nodes.forEach((node, index) => {
            node.setAttribute("data-lit", beat > index ? "true" : "false");
          });

          gsap.set(progress, {
            drawSVG: `0% ${(Math.min(beat, 3) / 3) * 100}%`,
          });
          gsap.set(sealCheck, { drawSVG: beat === LAST_BEAT ? "100%" : "0%" });
          gsap.set(seal, { autoAlpha: beat === LAST_BEAT ? 1 : 0.25 });
          gsap.set(owner, { autoAlpha: beat === LAST_BEAT ? 1 : 0 });
          gsap.set(pending, { autoAlpha: beat === LAST_BEAT ? 0 : 1 });
        };

        /** Joue le vol d'un fragment vers son champ. */
        const fly = (index: number) => {
          const fragment = fragments[index];
          const slot = slots[index];
          const split = splits[index];
          const node = nodes[index];
          if (!fragment || !slot || !split || !node) return;

          // Le double naît **dans** le fragment : il est donc exactement
          // à sa place, à son corps de texte, sans aucune mesure
          // manuelle. Flip fera le reste.
          const flyer = document.createElement("span");
          flyer.dataset.flyer = "";
          flyer.className = "v2-flyer";
          flyer.textContent = fragment.textContent ?? "";
          // Le texte est déjà lu deux fois dans l'arbre — dans la note et
          // dans le champ. Le double ne doit pas le faire lire une
          // troisième fois.
          flyer.setAttribute("aria-hidden", "true");
          fragment.appendChild(flyer);

          const state = Flip.getState(flyer);
          slot.appendChild(flyer);

          const tl = gsap.timeline();

          tl.add(
            Flip.from(state, {
              duration: 0.85,
              ease: "power2.inOut",
              scale: true,
              absolute: true,
            }),
          )
            // Flip n'interpole pas de courbe. Sans cet arc, la
            // translation lit comme un glissement, pas comme un passage.
            .to(
              flyer,
              { y: -18, duration: 0.42, ease: "power2.out" },
              0,
            )
            .to(flyer, { y: 0, duration: 0.43, ease: "power2.in" }, 0.42)
            .to(
              node,
              { attr: { "data-lit": "true" }, duration: 0 },
              0.5,
            )
            .to(
              progress,
              {
                drawSVG: `0% ${((index + 1) / 3) * 100}%`,
                duration: 0.7,
                ease: EASE,
              },
              0.15,
            )
            .to(flyer, { autoAlpha: 0, duration: 0.25 }, 0.8)
            .to(
              split.words,
              {
                autoAlpha: 1,
                duration: 0.5,
                ease: EASE,
                stagger: 0.035,
                onComplete: () => flyer.remove(),
              },
              0.75,
            )
            .to(
              fragment,
              { backgroundColor: "transparent", color: "var(--v2-ink)", duration: 0.4 },
              0.85,
            );

          return tl;
        };

        /** Le dernier temps : le sceau se trace, le document se pose. */
        const validate = () =>
          gsap
            .timeline()
            .to(seal, { autoAlpha: 1, duration: 0.3 })
            .to(sealCheck, { drawSVG: "100%", duration: 0.45, ease: EASE }, 0)
            .to(pending, { autoAlpha: 0, duration: 0.3 }, 0.1)
            .fromTo(
              owner,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE },
              0.25,
            );

        let current = 0;
        settle(0);

        const trigger = ScrollTrigger.create({
          trigger: track,
          pin: true,
          start: "top top",
          end: `+=${LAST_BEAT * 90}%`,
          // Le snap fait claquer la séquence d'un temps à l'autre au lieu
          // de la laisser baver entre deux états.
          snap: {
            snapTo: 1 / LAST_BEAT,
            duration: { min: 0.15, max: 0.4 },
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const next = Math.min(
              LAST_BEAT,
              Math.floor(self.progress * (LAST_BEAT + 0.4)),
            );
            if (next === current) return;

            // En descente on joue le geste, temps par temps. En remontée
            // on repose l'état, sans animation.
            if (self.direction === 1 && next === current + 1) {
              if (next === LAST_BEAT) validate();
              else fly(next - 1);
            } else {
              settle(next);
            }

            current = next;
          },
        });

        return () => {
          trigger.kill();
          splits.forEach((split) => split.revert());
          root.querySelectorAll("[data-flyer]").forEach((node) => node.remove());
          // L'état de repos est l'état final : si la mécanique est
          // démontée — redimensionnement sous 1024px — la démonstration
          // reste complète.
          settle(LAST_BEAT);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );
}
