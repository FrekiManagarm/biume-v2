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
        const fragments = q<HTMLElement>("[data-fragment]");
        const slots = q<HTMLElement>("[data-slot]");
        const values = q<HTMLElement>("[data-value]");
        const nodes = q<SVGCircleElement>("[data-rail-node]");
        const progress = q<SVGLineElement>("[data-rail-progress]")[0];
        const seal = q<HTMLElement>("[data-seal]")[0];
        const sealCheck = q<SVGPathElement>("[data-seal-check]")[0];
        const owner = q<HTMLElement>("[data-owner]")[0];
        const pending = q<HTMLElement>("[data-pending]")[0];

        // Un attribut renommé demain ne doit pas échouer en silence :
        // sans cette garde, GSAP logue « target undefined not found » et
        // toute la séquence s'arrête sans bruit. Même coût, échec bruyant.
        if (!progress || !sealCheck || !seal || !owner || !pending) return;

        const totalFragments = fragments.length;

        // GSAP interpole une couleur en la décomposant en canaux
        // numériques ; un jeton `var(--…)` n'expose rien à décomposer. Une
        // interpolation vers ce jeton ne produit donc rien d'utilisable —
        // on résout la valeur une fois, avant toute animation.
        const inkColor = getComputedStyle(root)
          .getPropertyValue("--v2-ink")
          .trim();

        // Chaque valeur est découpée par mots une fois pour toutes : la
        // révélation se joue ensuite sur des nœuds stables.
        const splits = values.map((value) =>
          SplitText.create(value, { type: "words", wordsClass: "v2-word" }),
        );

        // La timeline en cours — celle d'un vol ou celle de la validation.
        // Sans ce handle, `mm.revert()` ne peut pas la tuer : elle n'a été
        // enregistrée dans le contexte qu'à la création du ScrollTrigger,
        // pas à chaque `onUpdate`.
        let activeTimeline: gsap.core.Timeline | undefined;

        /** Repose l'état d'un temps sans l'animer. Sert au montage et à
         *  toute remontée : rejouer une timeline à l'envers pendant que
         *  le lecteur remonte donne le mal de mer. */
        const settle = (beat: number) => {
          activeTimeline?.kill();
          activeTimeline = undefined;

          gsap.killTweensOf([
            ...values,
            ...splits.flatMap((split) => split.words),
            ...nodes,
            progress,
            seal,
            sealCheck,
            owner,
            pending,
            ...fragments,
          ]);
          root.querySelectorAll("[data-flyer]").forEach((node) => node.remove());

          fragments.forEach((fragment, index) => {
            gsap.set(fragment, {
              backgroundColor:
                beat === index + 1 ? "var(--v2-mark)" : "transparent",
              color: beat > index ? "var(--v2-ink)" : "var(--v2-ink-soft)",
            });
          });

          splits.forEach((split, index) => {
            gsap.set(split.words, { autoAlpha: beat > index ? 1 : 0 });
          });

          nodes.forEach((node, index) => {
            node.setAttribute("data-lit", beat > index ? "true" : "false");
          });

          gsap.set(progress, {
            drawSVG: `0% ${(Math.min(beat, totalFragments) / totalFragments) * 100}%`,
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

          // Le surlignage désigne le passage en cours de traitement : le
          // vol qui commence l'allume sur son propre fragment, et c'est
          // le vol suivant (ou la validation, pour le dernier) qui
          // l'éteindra. Il ne s'éteint jamais sur son propre fragment ici
          // — sinon il ne serait jamais visible pendant la descente.
          const previous = fragments[index - 1];

          // Le double naît **dans** le fragment : il est donc exactement
          // à sa place, à son corps de texte, sans aucune mesure
          // manuelle. Flip fera le reste.
          //
          // Le déplacement que Flip calcule et l'arc qui le fait
          // « sauter » vivent sur deux nœuds distincts. Les écrire tous
          // les deux sur le même `y` ne marcherait que par ordre
          // d'insertion des tweens dans la timeline — un détail
          // d'implémentation, pas une garantie.
          const flyer = document.createElement("span");
          flyer.dataset.flyer = "";
          flyer.className = "v2-flyer";
          // Le texte est déjà lu deux fois dans l'arbre — dans la note et
          // dans le champ. Le double ne doit pas le faire lire une
          // troisième fois.
          flyer.setAttribute("aria-hidden", "true");

          const arc = document.createElement("span");
          arc.style.display = "inline-block";
          arc.textContent = fragment.textContent ?? "";
          flyer.appendChild(arc);
          fragment.appendChild(flyer);

          const state = Flip.getState(flyer);
          slot.appendChild(flyer);

          const tl = gsap.timeline();

          if (previous) {
            tl.set(previous, { backgroundColor: "transparent" }, 0);
          }
          tl.set(fragment, { backgroundColor: "var(--v2-mark)" }, 0);

          tl.add(
            Flip.from(state, {
              duration: 0.85,
              ease: "power2.inOut",
              scale: true,
              absolute: true,
            }),
            0,
          )
            // Flip n'interpole pas de courbe. Sans cet arc, la
            // translation lit comme un glissement, pas comme un passage.
            .to(arc, { y: -18, duration: 0.42, ease: "power2.out" }, 0)
            .to(arc, { y: 0, duration: 0.43, ease: "power2.in" }, 0.42)
            .call(() => node.setAttribute("data-lit", "true"), undefined, 0.5)
            .to(
              progress,
              {
                drawSVG: `0% ${((index + 1) / totalFragments) * 100}%`,
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
            // Le fragment d'origine reste marqué : c'est le vol suivant
            // (ou la validation) qui l'éteindra, jamais lui-même.
            .to(fragment, { color: inkColor, duration: 0.4 }, 0.85);

          return tl;
        };

        /** Le dernier temps : le sceau se trace, le document se pose. */
        const validate = () => {
          const tl = gsap.timeline();
          const last = fragments[totalFragments - 1];

          // Le dernier fragment flottait encore en surbrillance : plus
          // aucun vol ne suit pour l'éteindre, la validation s'en charge.
          if (last) {
            tl.set(last, { backgroundColor: "transparent" }, 0);
          }

          tl.to(seal, { autoAlpha: 1, duration: 0.3 }, 0)
            .to(sealCheck, { drawSVG: "100%", duration: 0.45, ease: EASE }, 0)
            .to(pending, { autoAlpha: 0, duration: 0.3 }, 0.1)
            .fromTo(
              owner,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE },
              0.25,
            );

          return tl;
        };

        /** Même calcul que côté `onUpdate` : dérive le temps courant à
         *  partir d'une progression 0-1. Factorisé pour ne pas se
         *  décorréler entre l'appel initial et les mises à jour. */
        const beatFromProgress = (value: number) =>
          Math.min(LAST_BEAT, Math.floor(value * (LAST_BEAT + 0.4)));

        let current = 0;

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
            const next = beatFromProgress(self.progress);
            if (next === current) return;

            // En descente on joue le geste, temps par temps. En remontée
            // on repose l'état, sans animation.
            if (self.direction === 1 && next === current + 1) {
              activeTimeline = next === LAST_BEAT ? validate() : fly(next - 1);
            } else {
              settle(next);
            }

            current = next;
          },
        });

        // ScrollTrigger n'appelle jamais `onUpdate` à sa propre création
        // (les deux déclenchements internes sont gardés par
        // `!_refreshing`) : seul un geste de scroll le fait. Un
        // rechargement avec restauration de position, un retour en
        // arrière depuis le bas de page, ou une ancre `#produit` qui
        // atterrit dans la piste laisseraient donc la section épinglée au
        // temps 0 jusqu'au premier geste. On dérive l'état réel dès la
        // création du trigger plutôt que de supposer un départ à zéro.
        current = beatFromProgress(trigger.progress);
        settle(current);

        return () => {
          trigger.kill();
          // L'état de repos est l'état final : si la mécanique est
          // démontée — redimensionnement sous 1024px — la démonstration
          // reste complète. Reposer l'état avant de rendre la main aux
          // `SplitText` : après leur `revert()`, `split.words` est vide
          // et `settle()` ne viserait plus rien.
          settle(LAST_BEAT);
          splits.forEach((split) => split.revert());
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );
}
