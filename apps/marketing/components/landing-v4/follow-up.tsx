"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

import { FOLLOW_UP } from "./content";
import { Reveal } from "./motion";

/**
 * Le suivi.
 *
 * Le fil est bleu parce que c'est son rôle dans le système : le bleu
 * relie. Il se dessine réellement, tiré par `DrawSVGPlugin` — pas une
 * barre qui grandit en `scaleX`, un tracé qui se pose. Les trois
 * repères s'allument dessus au passage, chacun quand le fil vient de
 * l'atteindre.
 *
 * Le tracé est lié au scroll : le lecteur tire le fil en descendant,
 * ce qui fait de la frise une progression et non une décoration.
 */
export function FollowUp() {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".lv4-thread-host",
            start: "top 80%",
            end: "top 36%",
            scrub: 0.6,
          },
        })
        .fromTo(
          ".lv4-thread",
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", ease: "none", duration: 1 },
          0,
        )
        .fromTo(
          ".lv4-milestone",
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            ease: "back.out(2)",
            duration: 0.2,
            stagger: 0.32,
          },
          0.05,
        );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="suivi"
      aria-labelledby="lv4-suivi-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-blue)]">
                <span aria-hidden="true" className="lv4-tick" />
                Le suivi
              </p>
            </Reveal>
            <Reveal as="h2">
              <span id="lv4-suivi-title" className="lv4-h2 mt-6 block">
                La séance ne s&apos;arrête pas quand vous refermez la porte.
              </span>
            </Reveal>
          </div>
          <Reveal as="p" className="lg:col-span-4 lg:col-start-9">
            <span className="lv4-body block text-[color:var(--lv4-text-2)] lg:mt-14">
              Trois moments préparés à l&apos;avance à partir de ce que vous
              avez écrit. Aucun ne part tout seul.
            </span>
          </Reveal>
        </div>

        <div className="lv4-thread-host relative mt-14">
          {/* Le fil, au-dessus des trois colonnes. Masqué sous md, où
              la frise bascule à la verticale et n'a plus d'axe. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            className="hidden h-0.5 w-full md:block"
          >
            <line
              className="lv4-thread"
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="var(--lv4-blue)"
              strokeWidth="2"
            />
          </svg>

          <ol className="grid md:grid-cols-3">
            {FOLLOW_UP.map((entry, index) => (
              <Reveal
                as="li"
                key={entry.when}
                className="relative border-b border-[color:var(--lv4-line)] pb-8 pt-7 md:border-b-0 md:border-l md:border-l-[color:var(--lv4-line)] md:pl-6 md:first:border-l-0 md:first:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="lv4-milestone lv4-pulse absolute -top-[5px] left-0 hidden size-2 rounded-full bg-[color:var(--lv4-blue)] text-[color:var(--lv4-blue)] md:block"
                  style={{ "--lv4-pulse-delay": `${index * 800}ms` } as never}
                />
                <p className="lv4-num text-[0.9rem] font-medium text-[color:var(--lv4-blue)]">
                  {entry.when}
                </p>
                <h3 className="lv4-h3 mt-3">{entry.title}</h3>
                <p className="lv4-body mt-2.5 max-w-[38ch] text-[color:var(--lv4-text-2)]">
                  {entry.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
