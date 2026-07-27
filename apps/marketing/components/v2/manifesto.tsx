"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

import { WIDE, ensureGsapPlugins } from "./reveal";

/**
 * Le geste signature de la page : le texte passe de l'encre « pas
 * encore lue » à l'encre pleine au fil du scroll. Le lecteur éprouve
 * exactement ce que le produit promet — un propos qui devient clair.
 *
 * Le contenu est la démonstration elle-même, pas une accroche.
 * Direction reprise de /v3, recomposée dans la DA de l'accueil.
 */
const MANIFESTO_BODY =
  "Vous notez « restriction thoracique gauche ». Le propriétaire lit « la mobilité du thorax a été travaillée pendant la séance ». Même observation, deux lecteurs. Biume écrit la seconde phrase.";

/** La phrase qui porte l'argument arrive en violet : le violet décide,
 *  et c'est elle qui affirme que le praticien garde ses mots. */
export const DECIDING_SENTENCE = "Vous gardez la première.";

/** Composé à partir de ses parties : la phrase décisive reste
 *  structurellement le suffixe du manifeste, le pivot du calcul de
 *  couleur ne peut donc pas se désynchroniser du texte affiché. */
export const MANIFESTO = `${MANIFESTO_BODY} ${DECIDING_SENTENCE}`;

export function V2Manifesto() {
  const host = useRef<HTMLDivElement | null>(null);
  const text = useRef<HTMLParagraphElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const node = text.current;
      if (!node) return;

      const mm = gsap.matchMedia();

      // Les deux requêtes sont déclarées ensemble : `conditions` n'est
      // peuplé qu'à l'intérieur du callback d'un `mm.add`, et il est
      // rejoué à chaque bascule — resize géré sans code supplémentaire.
      mm.add({ wide: WIDE, narrow: "(max-width: 1023px)" }, (context) => {
        const { wide } = context.conditions as { wide: boolean };

        // Découpage par mots (et par lignes, pour que la coupe suive la
        // largeur). Jamais par caractères : le texte serait épelé par
        // les lecteurs d'écran et la sélection casserait.
        SplitText.create(node, {
          type: "words,lines",
          wordsClass: "v2-word",
          autoSplit: true,
          onSplit(self) {
            const decidingCount = DECIDING_SENTENCE.split(" ").length;
            const words = self.words as HTMLElement[];
            const pivot = words.length - decidingCount;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: host.current,
                // Pinné sur écran large, simple scrub en dessous : sur
                // mobile le scroll n'est jamais capturé.
                pin: wide ? host.current : false,
                start: wide ? "top top" : "top 82%",
                end: wide ? "+=180%" : "bottom 45%",
                scrub: 0.6,
              },
            });

            tl.to(words.slice(0, pivot), {
              color: "var(--v2-ink)",
              stagger: 0.4,
              duration: 1,
              ease: "none",
            }).to(
              words.slice(pivot),
              {
                color: "var(--v2-violet-ink)",
                stagger: 0.4,
                duration: 1,
                ease: "none",
              },
              ">-0.2",
            );

            return tl;
          },
        });
      });

      return () => mm.revert();
    },
    { scope: host },
  );

  return (
    <section
      aria-labelledby="v2-manifeste-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div
        ref={host}
        className="mx-auto flex min-h-[70svh] max-w-[1200px] items-center px-5 py-28 md:px-8 md:py-36 lg:min-h-[100svh]"
      >
        {/* Le plan du document a besoin d'un titre ; la page, elle, n'a
            besoin que du texte. */}
        <h2 id="v2-manifeste-title" className="sr-only">
          Ce que le propriétaire lit
        </h2>
        <p
          ref={text}
          className="v2-manifesto mx-auto max-w-[22ch] [text-wrap:balance] md:max-w-[26ch]"
        >
          {MANIFESTO}
        </p>
      </div>
    </section>
  );
}
