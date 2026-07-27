"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";

import { Reveal } from "./motion";

/**
 * Un plan photographique pleine largeur.
 *
 * La photo n'illustre pas un argument, elle interrompt la lecture :
 * on quitte le produit, on revient à la scène de soin, puis on y
 * retourne. C'est ce battement qui empêche la page de se lire comme
 * une brochure.
 *
 * Trois traitements systématiques, jamais négociables :
 *   — recadrage serré sur le geste, pas sur le décor ;
 *   — vignettage et teinte aubergine, pour raccorder l'image au
 *     volume de la page au lieu de la laisser flotter ;
 *   — dérive à contre-scroll doublée d'un lent rapprochement, à
 *     vitesse réduite : l'image traverse moins de distance que le
 *     texte qui la longe.
 *
 * Le texte est posé en marge basse, jamais au centre par-dessus le
 * sujet : on ne pose pas un titre sur le visage d'une praticienne.
 */
export function PhotoPlate({
  src,
  alt,
  eyebrow,
  line,
  attribution,
  position = "50% 50%",
  height = "min-h-[76vh]",
}: {
  src: string;
  alt: string;
  eyebrow: string;
  line: string;
  attribution?: string;
  position?: string;
  height?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      // Deux courses distinctes sur le même parcours de scroll : la
      // translation creuse la profondeur, le rapprochement donne à la
      // scène le sentiment de se refermer sur le geste.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
          defaults: { ease: "none" },
        })
        .fromTo(".lv4-plate-img", { yPercent: -9 }, { yPercent: 9 }, 0)
        .fromTo(".lv4-plate-img", { scale: 1.18 }, { scale: 1.04 }, 0);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={eyebrow}
      className={`relative isolate flex ${height} items-end overflow-hidden border-y border-[color:var(--lv4-line)]`}
    >
      <div aria-hidden="true" className="absolute inset-x-0 -inset-y-[16%] -z-10">
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          className="lv4-plate-img object-cover"
          style={{ objectPosition: position }}
        />
      </div>

      {/* L'alternative textuelle vit ici plutôt que sur l'image : la
          photo décorative reste `alt=""`, et la description utile est
          lue une seule fois, au bon endroit du document. */}
      <span className="sr-only">{alt}</span>

      <div aria-hidden="true" className="lv4-tint -z-10" />
      <div aria-hidden="true" className="lv4-vignette -z-10" />

      <div className="mx-auto w-full max-w-[1320px] px-[var(--lv4-gutter)] pb-14 md:pb-20">
        <Reveal>
          <p className="lv4-note text-[color:var(--lv4-text-2)]">{eyebrow}</p>
        </Reveal>
        <Reveal>
          <p className="lv4-h2 mt-5 max-w-[19ch] text-[color:var(--lv4-text)]">
            {line}
          </p>
        </Reveal>
        {attribution ? (
          <Reveal>
            <p className="lv4-note mt-6 text-[color:var(--lv4-text-3)]">
              {attribution}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
