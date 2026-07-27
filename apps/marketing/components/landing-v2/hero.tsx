"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./constants";
import { HeroOrchestration, Parallax, Reveal } from "./motion";

/**
 * Composition asymétrique : la parole à gauche sur la toile, la
 * photographie à droite en pleine hauteur jusqu'au bord de l'écran.
 *
 * La photo est un sujet, pas un fond : aucun voile de lisibilité ne
 * lui est superposé, le texte vit sur la toile à contraste plein.
 */
export function Hero() {
  const title = useRef<HTMLHeadingElement | null>(null);

  return (
    <section
      aria-labelledby="lv2-hero-title"
      className="relative lg:grid lg:min-h-[100dvh] lg:grid-cols-[1fr_1.04fr] lg:items-stretch"
    >
      <div className="flex items-center px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32 lg:py-24">
        <HeroOrchestration titleRef={title}>
          <div className="ml-auto w-full max-w-[620px] lg:pr-12">
            <Reveal as="p" hero>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lv2-line)] bg-[color:var(--lv2-surface)] px-3 py-1.5 text-[0.8rem] font-medium text-[color:var(--lv2-ink-2)]">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--lv2-green)]"
                />
                Pour les ostéopathes animaliers
              </span>
            </Reveal>

            <h1
              ref={title}
              id="lv2-hero-title"
              className="lv2-display mt-6 text-[color:var(--lv2-ink)]"
            >
              De vos notes au propriétaire, sans perdre votre regard métier.
            </h1>

            <Reveal as="p" hero>
              <span className="lv2-body mt-6 block">
                Après la séance, vous écrivez comme vous avez toujours écrit.
                Biume met vos observations en forme pour le propriétaire. Vous
                relisez, vous ajustez, et rien ne part avant que vous le
                décidiez.
              </span>
            </Reveal>

            <Reveal hero>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  data-conversion="hero-signup"
                  className="lv2-btn lv2-btn-primary w-full sm:w-auto"
                >
                  Essayer gratuitement
                </Link>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion="hero-demo"
                  className="lv2-btn lv2-btn-secondary w-full sm:w-auto"
                >
                  Voir une démonstration
                </a>
              </div>
              <p className="mt-4 text-[0.85rem] text-[color:var(--lv2-ink-2)]">
                {TRIAL_NOTE}
              </p>
            </Reveal>
          </div>
        </HeroOrchestration>
      </div>

      <div className="relative min-h-[62svh] overflow-hidden lg:min-h-full">
        <Parallax distance={32} className="absolute inset-0">
          <div className="absolute inset-[-5%]">
            <Image
              src="/assets/images/landing/atelier-hero.webp"
              alt="Une ostéopathe animalière face à un cheval alezan, à l'entrée d'une écurie ouverte sur les prés."
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-[68%_50%]"
            />
          </div>
        </Parallax>
        {/* Aucun voile : le raccord avec la toile est une arête franche.
            Un dégradé posé sur les feuillages flous du bord gauche se
            lisait comme une bavure, pas comme une transition. */}
      </div>
    </section>
  );
}
