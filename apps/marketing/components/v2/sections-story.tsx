import Image from "next/image";

import { Stamp } from "./artifacts";
import { Reveal, RuleDraw } from "./reveal";

/** En-tête de section façon revue : folio mono + filet qui se dessine. */
function Folio({ n, label }: { n: string; label: string }) {
  return (
    <Reveal>
      <div className="flex items-baseline gap-4 md:gap-6">
        <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-accent-deep)]">
          Nº {n}
        </p>
        <RuleDraw className="h-px flex-1 self-center bg-[color:var(--v2-line)]" />
        <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]">
          {label}
        </p>
      </div>
    </Reveal>
  );
}

const transformationStages = [
  {
    n: "01",
    title: "Notes de séance",
    text: "Une note courte suffit à démarrer.",
  },
  {
    n: "02",
    title: "Reformulation guidée",
    text: "Le passage technique devient lisible sans être réécrit de toutes pièces.",
  },
  {
    n: "03",
    title: "Validation praticien",
    text: "Vous relisez, vous tranchez, puis le compte rendu est prêt.",
  },
] as const;

export function V2Transformation() {
  return (
    <section
      id="transformation"
      aria-labelledby="v2-transformation-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Folio n="02" label="La transformation" />

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <h2
              id="v2-transformation-title"
              className="v2-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
            >
              Ce que vous notez reste précis.{" "}
              <em className="text-[color:var(--v2-accent-deep)]">
                Ce que le propriétaire lit devient clair.
              </em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:pt-3">
            <p className="v2-dropcap max-w-[52ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
              Biume applique la même ligne de décision à chaque compte rendu :
              ce que vous avez observé reste fidèle, la reformulation reste
              sobre, et vous gardez la validation avant tout envoi.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid border-t border-[color:var(--v2-line-strong)] md:mt-20 md:grid-cols-3 md:divide-x md:divide-[color:var(--v2-line)]">
          {transformationStages.map((stage, index) => (
            <Reveal
              key={stage.n}
              delay={0.08 * index}
              className="border-b border-[color:var(--v2-line)] py-8 last:border-b-0 md:border-b-0 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0"
            >
              <p className="v2-mono text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-accent-deep)]">
                {stage.n}
              </p>
              <h3 className="v2-display mt-3 text-[1.45rem] font-medium leading-tight text-[color:var(--v2-ink)]">
                {stage.title}
              </h3>
              <p className="mt-3 max-w-[38ch] text-sm leading-6 text-[color:var(--v2-ink-soft)]">
                {stage.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const controlPoints = [
  {
    n: "01",
    title: "Relecture passage par passage",
    text: "Chaque section reste visible et contrôlable avant la validation.",
  },
  {
    n: "02",
    title: "Remplace le texte du champ courant",
    text: "Une correction part directement dans le compte rendu en préparation.",
  },
  {
    n: "03",
    title: "Le compte rendu reste modifiable",
    text: "Tant qu'il n'est pas validé, vous pouvez encore ajuster chaque passage.",
  },
  {
    n: "04",
    title: "Rien n'est partagé automatiquement",
    text: "La validation reste votre décision, à chaque séance.",
  },
] as const;

export function V2Control() {
  return (
    <section
      id="controle"
      aria-labelledby="v2-controle-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Folio n="03" label="Le contrôle" />

        <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <h2
                id="v2-controle-title"
                className="v2-display max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
              >
                Biume prépare.{" "}
                <em className="text-[color:var(--v2-accent-deep)]">
                  Vous gardez la main.
                </em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[48ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
                Vous relisez passage par passage, vous remplacez ce qui doit
                l'être, puis vous validez. Rien n'est envoyé au propriétaire
                sans cette décision.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-10">
                <Stamp>Relu et validé par vous</Stamp>
              </p>
            </Reveal>
          </div>

          <ol className="border-t border-[color:var(--v2-line-strong)]">
            {controlPoints.map((point, index) => (
              <li
                key={point.n}
                className="border-b border-[color:var(--v2-line)]"
              >
                <Reveal
                  delay={0.06 * index}
                  className="grid grid-cols-[auto_1fr] gap-5 py-6 md:gap-8"
                >
                  <p
                    aria-hidden="true"
                    className="v2-mono pt-1 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]"
                  >
                    {point.n}
                  </p>
                  <div>
                    <h3 className="text-base font-semibold leading-snug text-[color:var(--v2-ink)]">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 max-w-[52ch] text-sm leading-6 text-[color:var(--v2-ink-soft)]">
                      {point.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const followUpSteps = [
  {
    n: "01",
    title: "Le compte rendu est finalisé",
    text: "La séance est clôturée proprement, avec une trace claire pour le propriétaire.",
  },
  {
    n: "02",
    title: "Le suivi post-séance est préparé",
    text: "Biume prépare la suite sans vous demander de tout recopier.",
  },
  {
    n: "03",
    title: "Le rappel au propriétaire est confirmé",
    text: "Vous validez l'envoi, et la continuité du suivi est assurée.",
  },
] as const;

export function V2FollowUp() {
  return (
    <section
      id="suivi"
      aria-labelledby="v2-suivi-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Folio n="04" label="La continuité" />

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <h2
              id="v2-suivi-title"
              className="v2-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
            >
              Le compte rendu{" "}
              <em className="text-[color:var(--v2-accent-deep)]">
                ouvre la suite.
              </em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:pt-3">
            <p className="max-w-[52ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
              Un compte rendu finalisé prépare déjà la prochaine étape : le
              suivi post-séance prend forme, puis le rappel au propriétaire est
              confirmé avant envoi.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-0">
          {followUpSteps.map((step, index) => (
            <Reveal
              key={step.n}
              delay={0.08 * index}
              className="md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <div className="flex items-baseline gap-4">
                <p className="v2-display text-[2rem] font-medium leading-none text-[color:var(--v2-accent-deep)]">
                  {step.n}
                </p>
                <RuleDraw className="h-px flex-1 self-center bg-[color:var(--v2-line-strong)]" />
              </div>
              <h3 className="mt-5 max-w-[24ch] text-base font-semibold leading-snug text-[color:var(--v2-ink)]">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-[36ch] text-sm leading-6 text-[color:var(--v2-ink-soft)]">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function V2Field() {
  return (
    <section
      id="terrain"
      aria-labelledby="v2-terrain-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Folio n="05" label="Le terrain" />

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <h2
              id="v2-terrain-title"
              className="v2-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
            >
              Conçu autour du terrain,{" "}
              <em className="text-[color:var(--v2-accent-deep)]">
                pas autour d'un écran.
              </em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:pt-3">
            <p className="max-w-[52ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
              Entre deux séances, l'outil doit suivre votre rythme et laisser la
              trace au bon endroit, sans vous demander de reformuler tout le
              dossier.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <figure>
              <div className="v2-plate relative aspect-[4/5] overflow-hidden border border-[color:var(--v2-line)]">
                <Image
                  src="/assets/images/landing/atelier-practice.webp"
                  alt="Séance d'ostéopathie auprès d'un chien, en cabinet"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="v2-mono mt-3 flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                <span>Planche II — La séance</span>
                <span aria-hidden="true">fig. 02</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-6 lg:col-start-7 lg:mt-28">
            <figure>
              <div className="v2-plate relative aspect-[16/11] overflow-hidden border border-[color:var(--v2-line)]">
                <Image
                  src="/assets/images/landing/atelier-owner.webp"
                  alt="Échange entre l'ostéopathe et la propriétaire à la sortie de séance"
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="v2-mono mt-3 flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                <span>Planche III — L'échange propriétaire</span>
                <span aria-hidden="true">fig. 03</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
