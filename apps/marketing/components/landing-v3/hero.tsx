"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./chapters";
import { HeroOrchestration, Parallax, Reveal } from "./motion";

/**
 * Ouverture sur un plan sombre. La photographie occupe tout le cadre —
 * ce n'est pas un fond décoratif, c'est le sujet : une praticienne, un
 * animal, un lieu réel. Elle dérive légèrement au scroll, ce qui creuse
 * la profondeur entre l'image et le texte posé dessus.
 *
 * Les coupures du titre sont écrites à la main : ce sont elles qui
 * donnent la mesure. SplitText s'appuie dessus pour masquer chaque
 * ligne, et refait la coupe si la police ou la largeur change.
 */
export function Hero() {
  const title = useRef<HTMLHeadingElement | null>(null);

  return (
    <section
      aria-labelledby="lv3-hero-title"
      className="relative isolate flex min-h-[100dvh] items-end overflow-hidden bg-[color:var(--lv3-anthracite)]"
    >
      <Parallax distance={38} className="absolute inset-0 -z-10">
        <div className="absolute inset-[-6%]">
          <Image
            src="/assets/images/landing/atelier-hero.webp"
            alt="Une ostéopathe animalière face à un cheval alezan, à l'entrée d'une écurie ouverte sur les prés."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_50%]"
          />
        </div>
      </Parallax>

      {/* Voile calibré à la mesure : le plateau opaque couvre toute la
          colonne de texte, l'ouverture ne commence qu'au-delà. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(96deg, rgb(32 32 36 / 0.95) 0%, rgb(32 32 36 / 0.92) 52%, rgb(32 32 36 / 0.66) 78%, rgb(32 32 36 / 0.38) 100%)",
        }}
      />

      <HeroOrchestration titleRef={title}>
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-32 md:px-8 md:pb-24">
          <Reveal as="p" hero>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lv3-line-dark)] px-3 py-1.5 text-[0.8rem] font-medium text-[color:var(--lv3-on-photo)]">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[color:var(--lv3-green-on-dark)]"
              />
              Pour les ostéopathes animaliers
            </span>
          </Reveal>

          {/* Un seul bloc de texte, jamais des lignes découpées à la
              main : SplitText coupe lui-même selon la largeur réelle et
              recoupe quand la police charge. Des `<span>` par ligne
              colleraient les mots à la copie (« De vos notesau
              propriétaire »). La mesure est donnée par `max-width`, en
              `ch` — l'unité se calcule ici sur la taille display, qui
              est portée par le h1 lui-même. */}
          <h1
            ref={title}
            id="lv3-hero-title"
            className="lv3-display mt-7 max-w-[13ch] text-[color:var(--lv3-on-dark)]"
          >
            De vos notes au propriétaire, sans perdre votre regard métier.
          </h1>

          <Reveal as="p" hero>
            <span className="lv3-lead mt-7 block text-[color:var(--lv3-on-photo)]">
              Après la séance, vous écrivez comme vous avez toujours écrit.
              Biume met vos observations en forme pour le propriétaire. Vous
              relisez, vous ajustez, et rien ne part avant que vous le décidiez.
            </span>
          </Reveal>

          <Reveal hero>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="hero-signup"
                className="lv3-btn lv3-btn-on-dark w-full sm:w-auto"
              >
                Essayer gratuitement
              </Link>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="hero-demo"
                className="lv3-btn lv3-btn-ghost-dark w-full sm:w-auto"
              >
                Voir une démonstration
              </a>
            </div>
            <p className="mt-4 text-[0.85rem] text-[color:var(--lv3-on-photo)]">
              {TRIAL_NOTE}
            </p>
          </Reveal>
        </div>
      </HeroOrchestration>
    </section>
  );
}
