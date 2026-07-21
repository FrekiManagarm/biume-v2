import {
  CalendarCheck,
  Check,
  FileSearch,
  FileText,
  History,
  Mic,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./reveal";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

function SectionShell({
  id,
  ariaLabelledBy,
  children,
  className = "",
}: {
  id?: string;
  ariaLabelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`scroll-mt-24 ${className}`}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-8 md:py-32">
        {children}
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  id,
  center = false,
  eyebrowTone = "violet",
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  center?: boolean;
  eyebrowTone?: "violet" | "green";
  children?: ReactNode;
}) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      <p className={eyebrowTone === "green" ? "v2-eyebrow v2-eyebrow-green" : "v2-eyebrow"}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`v2-display mt-5 max-w-[22ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[color:var(--v2-ink)] [text-wrap:balance] ${center ? "mx-auto" : ""}`}
      >
        {title}
      </h2>
      {children ? (
        <div
          className={`mt-5 max-w-[56ch] text-[1rem] leading-[1.65] text-[color:var(--v2-ink-soft)] [text-wrap:pretty] ${center ? "mx-auto" : ""}`}
        >
          {children}
        </div>
      ) : null}
    </Reveal>
  );
}

/* ---------- Stat row — chiffres oversize, sans cartes ---------- */

const stats = [
  { value: "3 phrases", label: "dictées entre deux écuries" },
  { value: "≈ 2 min", label: "de relecture avant validation" },
  { value: "0", label: "compte rendu à rédiger le soir" },
] as const;

export function V2Stats() {
  return (
    <section
      aria-label="Chiffres clés"
      className="border-b border-[color:var(--v2-line)]"
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 md:grid-cols-3 md:px-8 md:py-24">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <p className="v2-display text-[clamp(2.6rem,4.6vw,4.5rem)] font-medium leading-none text-[color:var(--v2-ink)]">
              {stat.value}
            </p>
            <p className="mt-3 text-[0.88rem] text-[color:var(--v2-ink-faint)]">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Feature grid — cartes blanches, icônes thin-stroke ---------- */

const features = [
  {
    icon: Mic,
    title: "Dictée terrain",
    body: "Trois phrases à voix haute entre deux séances. Pas de clavier, pas de formulaire à remplir dans la boue.",
  },
  {
    icon: FileSearch,
    title: "Relecture contrôlée",
    body: "Biume propose, passage par passage. Vous corrigez directement, rien ne part sans votre validation.",
  },
  {
    icon: FileText,
    title: "Compte rendu PDF",
    body: "Un document structuré et professionnel, à votre nom, prêt à être remis ou envoyé au propriétaire.",
  },
  {
    icon: History,
    title: "Historique animal",
    body: "Chaque compte rendu enrichit le dossier de l'animal. La séance suivante part de ce qui s'est passé avant.",
  },
  {
    icon: CalendarCheck,
    title: "Séances pré-remplies",
    body: "Le suivi est préparé avant votre arrivée : points d'attention, évolutions, notes de la dernière fois.",
  },
  {
    icon: Send,
    title: "Envoi en un clic",
    body: "Le compte rendu part au propriétaire dès validation. Vous ne courez plus après vos envois le soir.",
  },
] as const;

export function V2Features() {
  return (
    <SectionShell id="fonctionnalites" ariaLabelledBy="v2-features-title">
      <SectionIntro
        eyebrow="Fonctionnalités"
        title="Du terrain au compte rendu, sans détour."
        id="v2-features-title"
      >
        <p>
          Chaque fonction existe pour une raison : vous faire gagner du temps
          sans jamais écrire à votre place.
        </p>
      </SectionIntro>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={(i % 3) * 0.08}>
            <article className="v2-card h-full p-8">
              <feature.icon
                aria-hidden="true"
                className="size-6 text-[color:var(--v2-violet-ink)]"
                strokeWidth={1.5}
              />
              <h3 className="mt-5 text-[1.15rem] font-medium tracking-[-0.01em] text-[color:var(--v2-ink)]">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-[0.95rem] leading-[1.6] text-[color:var(--v2-ink-soft)]">
                {feature.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

/* ---------- Split éditorial — contrôle ---------- */

const controlPoints = [
  "Relu et validé par vous, passage par passage",
  "Corrections directes dans le texte proposé",
  "Modifiable jusqu'à l'envoi — rien ne part seul",
] as const;

export function V2Control() {
  return (
    <SectionShell
      id="controle"
      ariaLabelledBy="v2-controle-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionIntro
            eyebrow="Le contrôle"
            title="Biume prépare. Vous décidez."
            id="v2-controle-title"
            eyebrowTone="green"
          >
            <p>
              La reformulation n’est jamais un texte imposé. C’est une base de
              travail que vous relisez avec votre regard de praticien — le
              compte rendu final reste le vôtre.
            </p>
          </SectionIntro>
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3.5">
              {controlPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4.5 shrink-0 text-[color:var(--v2-green)]"
                    strokeWidth={2}
                  />
                  <span className="text-[0.95rem] leading-[1.55] text-[color:var(--v2-ink)]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="v2-panel overflow-hidden p-2.5">
            <Image
              src="/assets/images/dashboard-image.jpg"
              alt="Interface de relecture Biume : le compte rendu proposé, prêt à être validé passage par passage."
              width={1920}
              height={1282}
              className="h-auto w-full rounded-[18px]"
            />
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ---------- Split éditorial — continuité ---------- */

export function V2FollowUp() {
  return (
    <SectionShell
      id="suivi"
      ariaLabelledBy="v2-suivi-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-last lg:order-first">
          <div className="v2-panel overflow-hidden p-2.5">
            <Image
              src="/assets/images/landing/atelier-practice.webp"
              alt="Ostéopathe animalier en séance, prenant de courtes notes entre deux gestes."
              width={1122}
              height={1402}
              className="h-auto w-full rounded-[18px]"
            />
          </div>
        </Reveal>
        <div>
          <SectionIntro
            eyebrow="La continuité"
            title="Le compte rendu ouvre la suite."
            id="v2-suivi-title"
            eyebrowTone="green"
          >
            <p>
              Le document ne dort pas dans un dossier. Il part au propriétaire,
              il nourrit l’historique de l’animal, et il prépare votre prochaine
              séance avant même que vous arriviez.
            </p>
          </SectionIntro>
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3.5">
              {[
                "Le propriétaire reçoit un compte rendu lisible, à votre nom",
                "L'historique de l'animal s'enrichit à chaque séance",
                "La séance suivante démarre avec les points d'attention déjà notés",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4.5 shrink-0 text-[color:var(--v2-green)]"
                    strokeWidth={2}
                  />
                  <span className="text-[0.95rem] leading-[1.55] text-[color:var(--v2-ink)]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- Pricing — carte blanche sur lin ---------- */

const included = [
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

export function V2Pricing() {
  return (
    <SectionShell
      id="tarifs"
      ariaLabelledBy="v2-tarifs-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <SectionIntro
        eyebrow="Tarifs"
        title="Une seule formule. Tout le parcours."
        id="v2-tarifs-title"
        center
      >
        <p>
          Pensée pour un praticien indépendant : pas de module caché, pas de
          tarif au rapport. L’essai gratuit permet de valider sur vos vraies
          séances.
        </p>
      </SectionIntro>
      <Reveal delay={0.1}>
        <div className="v2-panel mx-auto mt-14 max-w-[640px] p-8 md:p-12">
          <p className="v2-eyebrow v2-eyebrow-green">Formule Indépendant</p>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="v2-display text-[2.9rem] font-medium leading-none tracking-[-0.04em] text-[color:var(--v2-ink)]">
              24,99 €
            </span>
            <span className="text-[0.95rem] text-[color:var(--v2-ink-faint)]">
              / mois, facturé à l’année
            </span>
          </p>
          <p className="mt-2 text-[0.88rem] text-[color:var(--v2-ink-faint)]">
            ou 29,99 € sans engagement
          </p>
          <ul className="mt-8 space-y-3.5 border-t border-[color:var(--v2-line)] pt-8">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4.5 shrink-0 text-[color:var(--v2-green)]"
                  strokeWidth={2}
                />
                <span className="text-[0.95rem] leading-[1.55] text-[color:var(--v2-ink)]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="v2-btn v2-btn-primary v2-btn-lg w-full"
            >
              Commencer l’essai gratuit
            </Link>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="pricing-demo"
              className="v2-btn v2-btn-secondary w-full"
            >
              Demander une démo
            </a>
          </div>
          <p className="mt-5 text-center text-[0.84rem] text-[color:var(--v2-ink-faint)]">
            15 jours d’essai · Sans carte bancaire
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}

/* ---------- FAQ ---------- */

const faqItems = [
  {
    question: "Biume écrit-il le compte rendu à ma place ?",
    answer:
      "Non. Biume reformule vos observations dictées en une proposition structurée, que vous relisez et validez passage par passage. Le texte final est celui que vous avez approuvé — rien ne part sans vous.",
  },
  {
    question: "Combien de temps prend une séance avec Biume ?",
    answer:
      "Dicter vos observations prend une à deux minutes, à chaud, entre deux écuries. La relecture du compte rendu prend environ deux minutes le soir ou entre deux rendez-vous. C'est tout.",
  },
  {
    question: "Et si le style ne me ressemble pas ?",
    answer:
      "Vous corrigez directement la proposition, et Biume apprend de vos corrections au fil des comptes rendus. Le style converge vers le vôtre — jamais l'inverse.",
  },
  {
    question: "Que reçoit exactement le propriétaire ?",
    answer:
      "Un compte rendu PDF clair et professionnel, à votre nom : les observations de la séance, les points d'attention et les recommandations. Rien de plus, rien de moins.",
  },
  {
    question: "L'essai gratuit est-il vraiment sans engagement ?",
    answer:
      "Oui. Quinze jours, sur vos vraies séances, sans carte bancaire. Si Biume ne vous fait pas gagner de temps, vous n'avez rien à payer ni à annuler.",
  },
] as const;

export function V2Faq() {
  return (
    <SectionShell
      id="questions"
      ariaLabelledBy="v2-faq-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionIntro
          eyebrow="Questions"
          title="Les réponses avant l'essai."
          id="v2-faq-title"
        />
        <div>
          {faqItems.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.05}>
              <details className="group border-b border-[color:var(--v2-line)] py-6 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.05rem] font-medium tracking-[-0.01em] text-[color:var(--v2-ink)] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[1.3rem] font-light leading-none text-[color:var(--v2-violet-ink)] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-[1.65] text-[color:var(--v2-ink-soft)]">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- Close — stack centré sur lin ---------- */

export function V2Close() {
  return (
    <section
      aria-labelledby="v2-close-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 text-center md:px-8 md:py-36">
        <Reveal>
          <p className="v2-eyebrow v2-eyebrow-green">Essai gratuit</p>
          <h2
            id="v2-close-title"
            className="v2-display mx-auto mt-6 max-w-[18ch] text-[clamp(2.1rem,4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.045em] text-[color:var(--v2-ink)] [text-wrap:balance]"
          >
            Préparez votre prochain compte rendu.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-[1.02rem] leading-[1.65] text-[color:var(--v2-ink-soft)] [text-wrap:pretty]">
            Dictez vos observations de demain matin. Relisez le soir même un
            compte rendu prêt à partir — ou décidez que Biume n’est pas pour
            vous, sans rien payer.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="close-signup"
              className="v2-btn v2-btn-primary v2-btn-lg w-full sm:w-auto"
            >
              Commencer gratuitement
            </Link>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="close-demo"
              className="v2-btn v2-btn-secondary v2-btn-lg w-full sm:w-auto"
            >
              Demander une démo
            </a>
          </div>
          <p className="mt-6 text-[0.84rem] text-[color:var(--v2-ink-faint)]">
            15 jours d’essai · Sans carte bancaire
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

const footerColumns = [
  {
    title: "Produit",
    links: [
      { href: "#fonctionnalites", label: "Fonctionnalités" },
      { href: "#controle", label: "Le contrôle" },
      { href: "#suivi", label: "La continuité" },
      { href: "#tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
    ],
  },
] as const;

export function V2Footer() {
  return (
    <footer className="border-t border-[color:var(--v2-line)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="v2-display text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)]">
              Biume<span className="text-[color:var(--v2-accent)]">.</span>
            </p>
            <p className="mt-4 max-w-[30ch] text-[0.9rem] leading-[1.6] text-[color:var(--v2-ink-soft)]">
              Le compte rendu propriétaire des ostéopathes animaliers
              indépendants — dicté sur le terrain, validé par vous.
            </p>
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`Pied de page — ${column.title}`}>
              <p className="v2-eyebrow">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="v2-link text-[0.9rem] text-[color:var(--v2-ink-soft)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="v2-link text-[0.9rem] text-[color:var(--v2-ink-soft)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--v2-line)] pt-7 text-[0.82rem] text-[color:var(--v2-ink-faint)] sm:flex-row sm:items-center">
          <p>© 2026 Biume. Tous droits réservés.</p>
          <Link href="/" className="v2-link">
            Voir la version actuelle du site
          </Link>
        </div>
      </div>
    </footer>
  );
}
