import Image from "next/image";

import { V2Badge } from "./artifacts";
import { SectionIntro } from "./heading";
import { Reveal } from "./reveal";

function StepCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 text-[color:var(--v2-accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

const howItWorksSteps = [
  {
    n: "01",
    title: "Dictez vos observations",
    text: "À la sortie de séance, notez ou dictez l'essentiel en quelques phrases, dans vos mots. Une note courte suffit à démarrer.",
  },
  {
    n: "02",
    title: "Relisez la proposition",
    text: "Biume reformule chaque passage en langage clair pour le propriétaire. Vous gardez la main sur chaque ligne avant validation.",
  },
  {
    n: "03",
    title: "Envoyez le compte rendu",
    text: "Une fois validé, le compte rendu part au propriétaire en PDF professionnel — et le suivi de la prochaine séance est déjà préparé.",
  },
] as const;

export function V2HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      aria-labelledby="v2-how-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <SectionIntro eyebrow="Comment ça marche" title="Du terrain au compte rendu, en trois étapes." id="v2-how-title" align="center" />

        <ol className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {howItWorksSteps.map((step, index) => (
            <Reveal key={step.n} delay={index * 0.08}>
              <li className="v2-panel h-full p-7">
                <p className="v2-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--v2-accent-deep)]">
                  {step.n}
                </p>
                <h3 className="v2-display mt-4 text-[1.3rem] font-semibold tracking-[-0.015em] text-[color:var(--v2-ink)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.92rem] leading-6 text-[color:var(--v2-ink-soft)]">
                  {step.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const controlPoints = [
  {
    title: "Relecture passage par passage",
    text: "Chaque section du compte rendu reste visible et modifiable avant validation.",
  },
  {
    title: "Une correction, un remplacement",
    text: "Votre correction remplace directement le texte du champ courant, sans reformulation cachée.",
  },
  {
    title: "Modifiable jusqu'au bout",
    text: "Tant que le compte rendu n'est pas validé, chaque passage s'ajuste encore.",
  },
  {
    title: "Aucun envoi automatique",
    text: "Le partage au propriétaire reste votre décision, à chaque séance.",
  },
] as const;

export function V2Control() {
  return (
    <section
      id="controle"
      aria-labelledby="v2-control-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionIntro eyebrow="Le contrôle" title="Biume prépare. Vous décidez." id="v2-control-title">
            <p>
              Le compte rendu n'est jamais écrit à votre place. Il est préparé
              à partir de vos observations, puis relu et signé par vous — votre
              regard métier reste la source.
            </p>
            <div className="mt-6">
              <V2Badge>Relu et validé par vous</V2Badge>
            </div>
          </SectionIntro>
        </div>

        <ul className="space-y-3">
          {controlPoints.map((point, index) => (
            <Reveal key={point.title} delay={index * 0.06}>
              <li className="flex gap-4 rounded-xl border border-[color:var(--v2-line)] bg-[color:var(--v2-panel)] p-5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--v2-accent-soft)]">
                  <StepCheck />
                </span>
                <div>
                  <h3 className="text-[0.95rem] font-semibold tracking-[-0.005em] text-[color:var(--v2-ink)]">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--v2-ink-soft)]">
                    {point.text}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const followUpSteps = [
  {
    n: "01",
    title: "Le compte rendu part",
    text: "Le propriétaire reçoit un document clair, à votre nom, qu'il peut relire calmement après la séance.",
  },
  {
    n: "02",
    title: "Le suivi reste tracé",
    text: "Chaque séance s'ajoute à l'historique de l'animal : observations, évolutions, recommandations.",
  },
  {
    n: "03",
    title: "La prochaine séance est prête",
    text: "Rappels et points de vigilance repartent du compte rendu précédent, pas d'une page blanche.",
  },
] as const;

export function V2FollowUp() {
  return (
    <section
      id="suivi"
      aria-labelledby="v2-followup-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <SectionIntro eyebrow="La continuité" title="Le compte rendu ouvre la suite." id="v2-followup-title">
          <p>
            Un bon compte rendu ne termine pas la séance : il installe la
            relation avec le propriétaire et prépare la visite suivante.
          </p>
        </SectionIntro>

        <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {followUpSteps.map((step, index) => (
            <Reveal key={step.n} delay={index * 0.08}>
              <li className="h-full rounded-xl border border-[color:var(--v2-line)] bg-[color:var(--v2-panel)] p-7">
                <p className="v2-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
                  {step.n}
                </p>
                <h3 className="v2-display mt-4 text-[1.15rem] font-semibold tracking-[-0.01em] text-[color:var(--v2-ink)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.9rem] leading-6 text-[color:var(--v2-ink-soft)]">
                  {step.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const fieldPhotos = [
  {
    src: "/assets/images/landing/atelier-practice.webp",
    alt: "Ostéopathe animalier en séance avec un cheval",
    caption: "En séance",
  },
  {
    src: "/assets/images/landing/atelier-owner.webp",
    alt: "Ostéopathe animalier échangeant avec un propriétaire",
    caption: "Avec le propriétaire",
  },
] as const;

export function V2Field() {
  return (
    <section
      id="terrain"
      aria-labelledby="v2-field-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <SectionIntro eyebrow="Le terrain" title="Conçu pour le terrain, pas pour le bureau." id="v2-field-title">
          <p>
            Biume s'utilise entre deux écuries, sur téléphone, avec des notes
            courtes. Le soir, il ne reste rien à rédiger.
          </p>
        </SectionIntro>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
          {fieldPhotos.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 0.08}>
              <figure className="overflow-hidden rounded-2xl border border-[color:var(--v2-line)] bg-[color:var(--v2-panel)]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={800}
                  className="aspect-[3/2] w-full object-cover"
                />
                <figcaption className="v2-mono flex items-center gap-2 border-t border-[color:var(--v2-line)] px-5 py-3 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-[color:var(--v2-accent)]"
                  />
                  {photo.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
