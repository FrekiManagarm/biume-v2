import Image from "next/image";

import { JourneyStory } from "./landing/journey-story";
import { MotionReveal } from "./landing/motion-reveal";

const journey = [
  {
    title: "Observer",
    body: "Vous notez l’essentiel pendant ou juste après la séance.",
  },
  {
    title: "Valider",
    body: "Biume structure. Vous relisez chaque mot avant l’envoi.",
  },
  {
    title: "Suivre",
    body: "Le propriétaire répond simplement à J+7.",
  },
  {
    title: "Revoir",
    body: "L’évolution reste lisible au fil des rendez-vous.",
  },
] as const;

const outcomes = [
  {
    title: "Résumé propriétaire",
    body: "Une version courte et claire, validée par vous.",
  },
  {
    title: "Retour à J+7",
    body: "Le propriétaire partage ce qu’il observe sans friction.",
  },
  {
    title: "Timeline animal",
    body: "Séances, retours et évolution restent dans le même fil.",
  },
] as const;

export function FeaturesSection() {
  return (
    <>
      <section id="probleme" className="px-4 py-20 md:px-6 md:py-28">
        <div
          data-problem-composition
          className="mx-auto grid max-w-7xl items-end gap-8 lg:grid-cols-12 lg:gap-0"
        >
          <MotionReveal className="landing-media-frame relative aspect-[3/2] overflow-hidden rounded-[24px] bg-muted lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <Image
              src="/assets/images/landing/practitioner-dog.png"
              alt="Une praticienne accompagne un chien pendant une séance manuelle"
              fill
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </MotionReveal>

          <MotionReveal
            delay={0.08}
            className="relative z-10 max-w-2xl rounded-2xl border border-border bg-background/95 p-6 backdrop-blur-sm lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mb-12 lg:p-10"
          >
            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              La séance ne s&apos;arrête pas au rendez-vous.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-8 text-muted-foreground">
              Le propriétaire doit encore comprendre vos observations, savoir quoi surveiller et reconnaître le bon moment pour reprendre contact.
            </p>
          </MotionReveal>
        </div>
      </section>

      <JourneyStory steps={journey} />

      <section id="resultat" className="px-4 py-20 md:px-6 md:py-28">
        <div data-product-outcome className="mx-auto max-w-7xl">
          <MotionReveal className="max-w-4xl">
            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              Le propriétaire comprend. Vous gardez le fil.
            </h2>
          </MotionReveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
            <MotionReveal className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_28px_80px_-58px_var(--landing-shadow)] md:p-10 lg:col-span-8">
              <p className="font-mono text-xs font-semibold text-primary">
                Résumé propriétaire
              </p>
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">
                Après la séance
              </h3>
              <dl className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Points observés</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Vos observations, présentées dans un langage accessible.
                  </dd>
                </div>
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Conseils transmis</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Vos recommandations, relues et validées avant l&apos;envoi.
                  </dd>
                </div>
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Prochaine étape</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Les repères que vous choisissez pour la suite.
                  </dd>
                </div>
              </dl>
            </MotionReveal>

            <div className="grid gap-4 lg:col-span-4 lg:pt-16">
              {outcomes.map((outcome, index) => (
                <MotionReveal key={outcome.title} delay={index * 0.06}>
                  <article className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {outcome.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {outcome.body}
                    </p>
                  </article>
                </MotionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="controle" className="px-4 py-12 md:px-6 md:py-20">
        <div data-control-interlude className="mx-auto max-w-7xl">
          <MotionReveal className="grid gap-6 overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground md:px-12 md:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.045em] md:text-6xl">
              Biume prépare. Vous décidez.
            </h2>
            <p className="max-w-[62ch] text-base leading-7 opacity-80 md:text-lg md:leading-8">
              Vous relisez, corrigez et validez chaque message avant l&apos;envoi. Biume n&apos;établit aucun diagnostic et ne parle jamais à votre place.
            </p>
          </MotionReveal>
        </div>
      </section>
    </>
  );
}
