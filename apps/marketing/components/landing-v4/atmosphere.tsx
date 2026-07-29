"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * L'atmosphère de la page.
 *
 * Trois lumières fixes — violet, bleu, vert — dérivent lentement en
 * fond. Ce ne sont pas trois taches décoratives : ce sont les trois
 * couleurs de Biume dans leurs rôles habituels, ramenées à l'état de
 * sources. Le violet ouvre en haut à gauche, là où se prend la
 * décision ; le bleu tient le milieu, là où se noue la continuité ;
 * le vert ferme en bas, là où les choses se confirment.
 *
 * Par-dessus passe la nappe : le geste de motion signature. Une
 * lumière large traverse la page de haut en bas au rythme du scroll,
 * en changeant de teinte dans l'ordre du parcours produit. Elle n'a
 * pas de déclencheur — elle accompagne. C'est une respiration, pas un
 * effet.
 *
 * Le `scrub` numérique laisse la tête de lecture rattraper le scroll
 * avec un demi-temps de retard : c'est ce décalage, et non l'ampleur
 * du déplacement, qui donne la sensation de profondeur.
 *
 * Toute la couche est `fixed`, en retrait de z-index et
 * `pointer-events: none`. Seuls `transform` et `background` sont
 * touchés, sur des éléments qui ne participent à aucune mise en page.
 */
export function Atmosphere() {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
          defaults: { ease: "none" },
        })
        .fromTo(
          ".lv4-sheet",
          { yPercent: -60 },
          { yPercent: 190, duration: 1 },
          0,
        )
        .fromTo(
          ".lv4-sheet",
          { backgroundColor: "rgb(107 90 200 / 0.42)" },
          { backgroundColor: "rgb(93 155 184 / 0.36)", duration: 0.62 },
          0,
        )
        .to(
          ".lv4-sheet",
          { backgroundColor: "rgb(46 152 102 / 0.34)", duration: 0.38 },
          0.62,
        );
    },
    { scope: root },
  );

  return (
    <>
      <div ref={root} className="lv4-atmosphere" aria-hidden="true">
        <div className="lv4-glow lv4-glow-violet" />
        <div className="lv4-glow lv4-glow-blue" />
        <div className="lv4-glow lv4-glow-green" />
        <div className="lv4-sheet" />
        <div className="lv4-veil" />
        <div className="lv4-mesh">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>

      {/* Le grain vit sur sa propre couche fixe, au-dessus du contenu
          mais sous toute interaction. Il donne à l'image et aux aplats
          sombres une matière que le dégradé pur n'a pas. */}
      <div className="lv4-grain" aria-hidden="true" />
    </>
  );
}
