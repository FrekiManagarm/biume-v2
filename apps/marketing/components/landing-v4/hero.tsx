"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { webAppPath } from "../../lib/web-app-url";
import {
  DEMO_URL,
  HERO_LEAD,
  HERO_SPEC,
  HERO_TITLE_LINES,
  TRIAL_NOTE,
} from "./content";
import { CutReveal, Lit, Magnetic, Reveal } from "./motion";

/** Les trois temps du produit, chacun sous la couleur de son rôle :
 *  le praticien décide (violet), Biume relie les deux écritures
 *  (bleu), le praticien confirme (vert). */
const BEATS = [
  {
    who: "Vous",
    value: "Écrivez vos notes comme d'habitude",
    tone: "var(--lv4-violet)",
  },
  {
    who: "Biume",
    value: "Met en forme pour le propriétaire",
    tone: "var(--lv4-blue)",
  },
  {
    who: "Vous",
    value: "Relisez, corrigez, envoyez",
    tone: "var(--lv4-green)",
  },
] as const;

/**
 * Ouverture pleine hauteur sur la scène de soin.
 *
 * La photographie occupe tout le cadre — ce n'est pas un fond, c'est
 * le sujet : une praticienne, un cheval, un lieu réel.
 *
 * Deux régimes d'animation cohabitent, et c'est voulu :
 *
 *  — une **timeline d'ouverture**, jouée une fois au chargement. Elle
 *    est la seule de la page à ne pas dépendre du scroll : la photo se
 *    dilate lentement, le titre monte ligne à ligne, le reste suit.
 *  — trois **courses liées au scroll**, à des vitesses distinctes :
 *    la photo à 0.6, le texte à 1, la fiche produit un peu au-dessus.
 *    La profondeur vient de cet écart, pas d'un effet.
 *
 * Le titre est calé à gauche, jamais centré par-dessus le sujet.
 */
export function Hero() {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      // ── Ouverture ──────────────────────────────────────────────
      // Le cadre se pose : la photo se dilate depuis un cadrage plus
      // serré pendant que les blocs de texte montent. Rien ne « pop » ;
      // tout se dépose.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(
          ".lv4-hero-photo",
          { scale: 1.14, autoAlpha: 0, duration: 2.2, ease: "power2.out" },
          0,
        )
        .from(
          "[data-hero]",
          { autoAlpha: 0, y: 18, duration: 1.1, stagger: 0.12 },
          0.35,
        );

      // ── Courses liées au scroll ────────────────────────────────
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.35,
          },
          defaults: { ease: "none" },
        })
        // La photo se retire au lieu de disparaître d'un coup sous la
        // section suivante.
        .to(".lv4-hero-photo", { yPercent: 14, autoAlpha: 0.3 }, 0)
        .to(".lv4-hero-spec", { yPercent: -26 }, 0)
        .to(".lv4-hero-copy", { yPercent: -8 }, 0);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="lv4-hero-title"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="lv4-hero-photo absolute inset-x-0 -top-[8%] bottom-[-16%] -z-10"
      >
        <Image
          src="/assets/images/landing/atelier-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          /* Le cadrage suit la largeur : sur une colonne étroite, la
             photo n'offre qu'une tranche verticale, et à 68 % cette
             tranche tombe sur le montant de l'écurie. On se recale
             sur le cheval et la praticienne. */
          className="object-cover object-[80%_44%] md:object-[68%_50%]"
        />
      </div>
      <span className="sr-only">
        Une ostéopathe animalière face à un cheval alezan, à l&apos;entrée
        d&apos;une écurie ouverte sur les prés.
      </span>

      <div aria-hidden="true" className="lv4-tint -z-10" />

      {/* Le voile change d'axe avec la mise en page, et c'est la seule
          façon de garder la scène visible dans les deux cas.
          Sur une colonne, le texte occupe toute la largeur : un voile
          horizontal masquerait la photo entière. Il devient donc
          vertical — la scène respire en haut, le texte se pose sur le
          bas assombri. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgb(11 9 16 / 0.34) 0%, rgb(11 9 16 / 0.72) 34%, rgb(11 9 16 / 0.93) 62%, var(--lv4-void) 100%)",
        }}
      />
      {/* À partir de md, le texte tient sept colonnes sur douze : le
          voile redevient directionnel, opaque sur la colonne de texte
          et ouvert au-delà, là où se tient la scène. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(94deg, rgb(11 9 16 / 0.93) 0%, rgb(11 9 16 / 0.86) 44%, rgb(11 9 16 / 0.5) 70%, rgb(11 9 16 / 0.2) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-64"
        style={{
          background:
            "linear-gradient(to top, var(--lv4-void) 0%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-[1320px] flex-col justify-end px-[var(--lv4-gutter)] pb-24 pt-32 md:pb-28">
        <div className="grid gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="lv4-hero-copy lg:col-span-7">
            <Reveal as="p" hero>
              <span className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
                <span aria-hidden="true" className="lv4-tick" />
                Ostéopathie animalière
              </span>
            </Reveal>

            {/* Aucune contrainte de largeur ici : les coupures de ligne
                sont écrites à la main dans `content.ts`, ce sont elles
                qui donnent la mesure du bloc. */}
            <h1 className="mt-7">
              <CutReveal
                id="lv4-hero-title"
                lines={HERO_TITLE_LINES}
                className="lv4-display block"
              />
            </h1>

            <Reveal as="p" hero>
              <span className="lv4-lead mt-7 block text-[color:var(--lv4-text-2)]">
                {HERO_LEAD}
              </span>
            </Reveal>

            <Reveal hero>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Magnetic>
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    data-conversion="hero-signup"
                    className="lv4-btn lv4-btn-primary w-full sm:w-auto"
                  >
                    Essayer gratuitement
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-conversion="hero-demo"
                    className="lv4-btn lv4-btn-ghost w-full sm:w-auto"
                  >
                    Voir une démonstration
                  </a>
                </Magnetic>
              </div>
              <p className="lv4-note mt-5 text-[color:var(--lv4-text-3)]">
                {TRIAL_NOTE}
              </p>
            </Reveal>
          </div>

          {/* La fiche produit, en surimpression latérale : nette et
              calme, elle dit en cinq lignes ce que la page met ensuite
              trois écrans à démontrer — la limite comprise, posée
              avant l'argument. */}
          <div className="lv4-hero-spec lg:col-span-4 lg:col-start-9">
            <Reveal hero>
              <Lit className="lv4-surface bg-[color:var(--lv4-surface)]/85 p-6 backdrop-blur-md">
                <p className="lv4-note text-[color:var(--lv4-text-3)]">
                  Fiche produit
                </p>
                <dl className="mt-4">
                  {HERO_SPEC.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[5.25rem_1fr] gap-4 border-b border-[color:var(--lv4-line)] py-3.5 last:border-b-0 last:pb-0"
                    >
                      <dt className="lv4-note pt-0.5 text-[color:var(--lv4-text-3)]">
                        {row.key}
                      </dt>
                      <dd className="text-[0.92rem] leading-[1.5] text-[color:var(--lv4-text)]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Lit>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Les trois temps, en bande basse. Ce ne sont pas des cartes :
          ni fond, ni ombre, seulement des filets. */}
      <Reveal>
        <div className="relative border-y border-[color:var(--lv4-line)] bg-[color:var(--lv4-void)]/80 backdrop-blur-sm">
          <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)]">
            <ol className="grid sm:grid-cols-3">
              {BEATS.map((beat, index) => (
                <li
                  key={beat.value}
                  className="border-b border-[color:var(--lv4-line)] py-6 last:border-b-0 sm:border-b-0 sm:border-l sm:py-8 sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
                >
                  <p className="lv4-note flex items-center gap-2.5 text-[color:var(--lv4-text-3)]">
                    <span
                      aria-hidden="true"
                      className="lv4-pulse size-1.5 rounded-full"
                      style={
                        {
                          color: beat.tone,
                          backgroundColor: beat.tone,
                          "--lv4-pulse-delay": `${index * 700}ms`,
                        } as never
                      }
                    />
                    <span style={{ color: beat.tone }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {beat.who}
                  </p>
                  <p className="mt-2.5 text-[1.02rem] font-medium leading-[1.35] tracking-[-0.015em]">
                    {beat.value}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
