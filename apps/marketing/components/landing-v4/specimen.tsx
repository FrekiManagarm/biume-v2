"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

import { SPECIMEN_NOTE, SPECIMEN_STEPS, SPECIMEN_SUBJECT } from "./content";
import { Reveal } from "./motion";

type Step = (typeof SPECIMEN_STEPS)[number];

/** Le volet suspendu s'allume quand le pas correspondant devient
 *  actif ; le volet mobile, qui défile normalement, s'allume quand il
 *  traverse le champ. Deux régimes, deux déclencheurs. */
type Mode = "sticky" | "flow";

/**
 * La phrase de sortie s'allume mot à mot.
 *
 * Chaque mot passe de l'encre éteinte au violet, puis au blanc plein :
 * la couleur de la décision traverse la phrase, exactement comme la
 * reformulation traverse la note. Le `stagger` fait le reste.
 *
 * L'animation vise des nœuds, jamais un état React : rien ne se
 * re-rend pendant l'allumage, quel que soit le nombre de mots.
 */
function InkedText({
  text,
  mode,
  play,
}: {
  text: string;
  mode: Mode;
  play: boolean;
}) {
  const host = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const node = host.current;
      if (!node) return;

      const targets = node.querySelectorAll(".lv4-word");
      const ignite = () =>
        gsap.fromTo(
          targets,
          { color: "var(--lv4-text-3)", textShadow: "0 0 14px rgb(154 140 233 / 0)" },
          {
            keyframes: [
              {
                color: "var(--lv4-violet)",
                textShadow: "0 0 14px rgb(154 140 233 / 0.55)",
                duration: 0.2,
              },
              {
                color: "var(--lv4-text)",
                textShadow: "0 0 14px rgb(154 140 233 / 0)",
                duration: 0.7,
              },
            ],
            ease: "none",
            stagger: 0.035,
            overwrite: "auto",
          },
        );

      if (mode === "flow") {
        ScrollTrigger.create({
          trigger: node,
          start: "top 82%",
          once: true,
          onEnter: ignite,
        });
        return;
      }

      if (play) ignite();
    },
    { scope: host, dependencies: [play, mode], revertOnUpdate: true },
  );

  return (
    <p ref={host} className="text-[1.02rem] leading-[1.62]">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="lv4-word">
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/** Le volet : la note brute, le seuil de transformation, la phrase
 *  lisible. C'est la démonstration entière du produit, en un bloc. */
function Pane({
  step,
  index,
  active,
  mode,
}: {
  step: Step;
  index: number;
  active: boolean;
  mode: Mode;
}) {
  return (
    <div
      className="lv4-pane"
      data-active={active ? "true" : undefined}
      aria-hidden={active ? undefined : "true"}
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv4-line)] px-5 py-3.5 md:px-7">
        <p className="lv4-note text-[color:var(--lv4-violet)]">{step.label}</p>
        <p className="lv4-note text-[color:var(--lv4-text-3)]">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(SPECIMEN_STEPS.length).padStart(2, "0")}
        </p>
      </div>

      <div className="bg-black/25 px-5 py-5 md:px-7 md:py-6">
        <p className="lv4-note text-[color:var(--lv4-text-3)]">
          Votre note, telle quelle
        </p>
        <p className="lv4-raw mt-3 text-[color:var(--lv4-text-2)]">{step.raw}</p>
      </div>

      {/* Le seuil. La barre porte la lumière violette en mouvement :
          c'est le seul endroit de la page où quelque chose travaille
          sans qu'on le lui demande. */}
      <div className="relative border-y border-[color:var(--lv4-line)] px-5 py-2.5 md:px-7">
        <span
          aria-hidden="true"
          className="lv4-shimmer absolute inset-x-0 top-0 block h-px"
        />
        <div className="flex items-center gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="size-3.5 shrink-0 text-[color:var(--lv4-violet)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 2.5v11" />
            <path d="m4 9.5 4 4 4-4" />
          </svg>
          <p className="lv4-note text-[color:var(--lv4-text-3)]">Mise en forme</p>
        </div>
      </div>

      <div className="px-5 py-5 md:px-7 md:py-6">
        <p className="lv4-note text-[color:var(--lv4-text-3)]">
          Ce que le propriétaire lit
        </p>
        <div className="mt-3">
          <InkedText text={step.out} mode={mode} play={active} />
        </div>
      </div>
    </div>
  );
}

/**
 * Le relevé — le geste signature de la v4.
 *
 * Le document reste en vue, suspendu au centre du volume, pendant que
 * les quatre passages défilent à côté. Ce n'est pas une capture
 * d'écran : le document est construit en balisage, donc lisible au
 * clavier, sélectionnable, et vrai à la lettre près.
 *
 * L'activation passe par un ScrollTrigger par pas, avec une bande
 * d'activation étroite au centre de l'écran : un pas devient actif
 * quand il la traverse, pas quand il apparaît. Le même trigger sert
 * dans les deux sens de lecture, ce qui rend le retour en arrière
 * aussi juste que la descente.
 *
 * Mécanique de volets suspendus adaptée de « Scroll 01 »
 * (@felipemenezes098, 21st.dev). Deux écarts délibérés : les volets ne
 * portent aucune image — ils portent le document lui-même — et la
 * phrase de sortie s'allume mot à mot au lieu d'apparaître d'un bloc.
 */
export function Specimen() {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".lv4-step");

      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 52%",
          end: "bottom 52%",
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="releve"
      aria-labelledby="lv4-releve-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <Reveal>
          <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
            <span aria-hidden="true" className="lv4-tick" />
            Le relevé
          </p>
        </Reveal>

        <div className="mt-7 grid gap-x-8 gap-y-6 lg:grid-cols-12">
          <Reveal as="h2" className="lg:col-span-6">
            <span id="lv4-releve-title" className="lv4-h2 block">
              Quatre passages, de votre écriture à la sienne.
            </span>
          </Reveal>
          <Reveal as="p" className="lg:col-span-4 lg:col-start-9">
            <span className="lv4-body block text-[color:var(--lv4-text-2)]">
              Le document ci-contre est construit en code, pas
              photographié : ce que vous lisez est exactement ce que Biume
              produit.
            </span>
          </Reveal>
        </div>

        {/* ── Mobile : chaque pas porte son propre volet ── */}
        <ol className="mt-12 lg:hidden">
          {SPECIMEN_STEPS.map((step, index) => (
            <li key={step.id} className="mb-12 last:mb-0">
              <p className="lv4-note text-[color:var(--lv4-violet)]">
                {String(index + 1).padStart(2, "0")} — {step.label}
              </p>
              <h3 className="lv4-h3 mt-3">{step.heading}</h3>
              <p className="lv4-body mt-2.5 text-[color:var(--lv4-text-2)]">
                {step.body}
              </p>
              <div className="lv4-surface mt-5 overflow-hidden">
                <Pane step={step} index={index} active mode="flow" />
              </div>
            </li>
          ))}
        </ol>

        {/* ── À partir de lg : les pas défilent, le document reste ── */}
        <div className="mt-14 hidden gap-x-8 lg:grid lg:grid-cols-12">
          <ol className="lg:col-span-4">
            {SPECIMEN_STEPS.map((step, index) => (
              <li
                key={step.id}
                data-active={active === index ? "true" : undefined}
                className="lv4-step py-[17vh] pl-6 first:pt-[6vh] last:pb-[18vh]"
              >
                <p className="lv4-note lv4-step-label">
                  {String(index + 1).padStart(2, "0")} — {step.label}
                </p>
                <h3 className="lv4-h3 mt-3">{step.heading}</h3>
                <p className="lv4-body mt-2.5 text-[color:var(--lv4-text-2)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="lg:col-span-7 lg:col-start-6">
            {/* Le panneau se cale au centre de l'écran, mais par son
                `top` et non par un conteneur pleine hauteur : un bloc
                collant aussi haut que l'écran sort de son parent bien
                avant la fin de la section et se décroche en route. */}
            <div className="sticky top-[calc(50dvh-14.5rem)]">
              <div className="lv4-surface overflow-hidden">
                <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--lv4-line)] bg-white/[0.03] px-7 py-3">
                  <p className="lv4-note text-[color:var(--lv4-text)]">
                    Relevé de séance
                  </p>
                  <p className="lv4-num text-[0.78rem] text-[color:var(--lv4-text-3)]">
                    {SPECIMEN_SUBJECT}
                  </p>
                </div>

                {/* Les volets se croisent en opacité et en échelle,
                    empilés dans une grille : aucune hauteur n'est
                    animée, et le bloc garde la mesure du plus haut. */}
                <div className="grid">
                  {SPECIMEN_STEPS.map((step, index) => (
                    <div key={step.id} className="col-start-1 row-start-1">
                      <Pane
                        step={step}
                        index={index}
                        active={active === index}
                        mode="sticky"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="lv4-note mt-4 text-[color:var(--lv4-text-3)]">
                {SPECIMEN_NOTE}
              </p>
            </div>
          </div>
        </div>

        <p className="lv4-note mt-10 text-[color:var(--lv4-text-3)] lg:hidden">
          {SPECIMEN_NOTE}
        </p>
      </div>
    </section>
  );
}
