import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { webAppPath } from "../../lib/web-app-url";
import { CutLines, Drift, Reveal } from "./reveal";

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
      <CutLines
        as="h2"
        id={id}
        className={`v2-display mt-5 max-w-[22ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[color:var(--v2-ink)] [text-wrap:balance] ${center ? "mx-auto" : ""}`}
      >
        {title}
      </CutLines>
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

/* ---------- Split éditorial — contrôle ---------- */

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
            title="Biume prépare. Vous gardez la main."
            id="v2-controle-title"
            eyebrowTone="green"
          >
            <p>
              Biume structure vos notes sans décider à votre place. Vous
              relisez, reformulez et validez chaque passage. Rien n’est partagé
              automatiquement.
            </p>
          </SectionIntro>
          <Reveal>
            <ul className="mt-8 space-y-3.5">
              {[
                "Vous relisez et validez chaque passage",
                "Vous pouvez reformuler directement le texte proposé",
                "Vous validez chaque passage avant le partage",
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
        <Reveal>
          <div data-control-panel="true" className="v2-panel p-6 md:p-8">
            <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
              <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                Relecture du compte rendu
              </h3>
              <p className="v2-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--v2-ink-faint)]">
                Brouillon
              </p>
            </header>

            <dl className="mt-6 space-y-5">
              {REPORT_TRANSFORMATION_DEMO.sections.map((section) => (
                <div
                  key={section.label}
                  className="border-l border-[color:var(--v2-line-strong)] pl-4"
                >
                  <dt className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                    {section.label}
                  </dt>
                  <dd className="mt-1.5 text-[1rem] leading-[1.55] text-[color:var(--v2-ink)]">
                    {section.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-[color:var(--v2-line)] pt-6">
              <span className="v2-btn v2-btn-primary v2-btn-sm">
                Valider ce passage
              </span>
              <span className="v2-btn v2-btn-secondary v2-btn-sm">
                Reformuler
              </span>
              <p className="ml-auto text-[0.82rem] text-[color:var(--v2-ink-faint)]">
                Aucun envoi tant que vous n&apos;avez pas validé.
              </p>
            </div>
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
      id="methode"
      ariaLabelledBy="v2-suivi-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-last lg:order-first">
          <div className="v2-panel overflow-hidden p-2.5">
            <Drift distance={18}>
              <Image
                src="/assets/images/landing/atelier-practice.webp"
                alt="Ostéopathe animalier en séance, prenant de courtes notes entre deux gestes."
                width={1122}
                height={1402}
                className="h-auto w-full rounded-[18px]"
              />
            </Drift>
          </div>
        </Reveal>
        <div>
          <SectionIntro
            eyebrow="La méthode"
            title="Le compte rendu ouvre la suite."
            id="v2-suivi-title"
            eyebrowTone="green"
          >
            <p>
              Vous finalisez le compte rendu, préparez le prochain contact et
              confirmez le rappel à la date choisie.
            </p>
          </SectionIntro>
          <Reveal>
            <ul className="mt-8 space-y-3.5">
              {[
                "Vous relisez et finalisez le document après la séance.",
                "Vous choisissez la date et le message du prochain rappel.",
                "Le rappel est enregistré à la date que vous avez choisie.",
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

/* ---------- Terrain — séquence réelle de l'accueil ---------- */

export function V2FieldStories() {
  return (
    <SectionShell
      ariaLabelledBy="v2-field-stories-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <SectionIntro
          eyebrow="Le terrain"
          title="Conçu autour du terrain, pas autour d’un écran."
          id="v2-field-stories-title"
        >
          <p>
            Biume suit la séquence réelle après la séance : écrire à partir de
            vos notes, expliquer clairement au propriétaire, valider avant
            l’envoi, puis maintenir le contact.
          </p>
        </SectionIntro>
        <Reveal>
          <div className="grid grid-cols-[1.14fr_0.86fr] items-end gap-4 md:gap-6">
            <Drift distance={18}>
              <Image
                src="/assets/images/landing/atelier-practice.webp"
                alt="Les mains d’une ostéopathe animalière palpant l’épaule d’un chien calme"
                width={1122}
                height={1402}
                className="w-full rounded-[24px]"
              />
            </Drift>
            <Drift distance={30}>
              <Image
                src="/assets/images/landing/atelier-owner.webp"
                alt="Une ostéopathe animalière échangeant avec la propriétaire d’un chien après la séance"
                width={1122}
                height={1402}
                className="mb-[12%] w-full rounded-[24px]"
              />
            </Drift>
          </div>
        </Reveal>
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
        title="Tout le parcours. Un seul abonnement."
        id="v2-tarifs-title"
        center
      >
        <p>
          Essai gratuit de 15 jours, sans carte bancaire. L’abonnement peut
          être arrêté depuis les paramètres.
        </p>
      </SectionIntro>
      <div className="v2-panel mx-auto mt-14 max-w-[640px] p-8 md:p-12">
        <Reveal>
          <p className="v2-eyebrow v2-eyebrow-green">Formule Indépendant</p>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="v2-display text-[2.9rem] font-medium leading-none tracking-[-0.04em] text-[color:var(--v2-ink)]">
              24,99 €
            </span>
            <span className="text-[0.95rem] text-[color:var(--v2-ink-faint)]">
              par mois, facturé annuellement
            </span>
          </p>
          <p className="mt-2 text-[0.88rem] text-[color:var(--v2-ink-faint)]">
            299,88 € facturés une fois par an
          </p>
        </Reveal>
        <Reveal>
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
        </Reveal>
        <Reveal>
          <div className="mt-6 border-t border-[color:var(--v2-line)] pt-6">
            <p className="v2-display text-[1.6rem] font-medium leading-none tracking-[-0.04em] text-[color:var(--v2-ink)]">
              29,99 €{" "}
              <span className="text-[0.95rem] font-normal tracking-normal text-[color:var(--v2-ink-faint)]">
                par mois
              </span>
            </p>
            <p className="mt-2 text-[0.88rem] text-[color:var(--v2-ink-faint)]">
              Facturation mensuelle, résiliable en fin de période
            </p>
          </div>
        </Reveal>
        <div className="mt-9 flex flex-col gap-3">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="pricing-signup"
            className="v2-btn v2-btn-primary v2-btn-lg w-full"
          >
            Essayer gratuitement
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
    </SectionShell>
  );
}

/* ---------- FAQ ---------- */

const faqItems = [
  {
    question: "Biume remplace-t-il un logiciel de gestion ?",
    answer:
      "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.",
  },
  {
    question: "Biume écrit-il à la place du praticien ?",
    answer:
      "Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.",
  },
  {
    question: "Chaque texte peut-il être modifié avant le partage ?",
    answer:
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.",
  },
  {
    question: "Que reçoit le propriétaire ?",
    answer:
      "Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.",
  },
  {
    question: "Comment arrêter l'abonnement ?",
    answer:
      "Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
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
          title="Avant de commencer."
          id="v2-faq-title"
        />
        <div>
          {faqItems.map((item, i) => (
            <Reveal key={item.question}>
              <details
                data-v2-faq-item={item.question}
                className="group border-b border-[color:var(--v2-line)] first:border-t"
              >
                <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-4 py-6 text-left [&::-webkit-details-marker]:hidden md:gap-6 md:py-7">
                  <span className="v2-mono text-[0.72rem] font-medium tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[1.06rem] font-medium leading-[1.35] tracking-[-0.02em] text-[color:var(--v2-ink)] transition-colors duration-200 group-hover:text-[color:var(--v2-violet-ink)] group-open:text-[color:var(--v2-violet-ink)] md:text-[1.18rem]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full border border-[color:var(--v2-line-strong)] text-[1.35rem] font-light leading-none text-[color:var(--v2-violet-ink)] transition-[background-color,border-color,color,transform] duration-300 group-hover:border-[color:var(--v2-violet-ink)] group-open:rotate-45 group-open:border-[color:var(--v2-violet-ink)] group-open:bg-[color:var(--v2-violet-ink)] group-open:text-white"
                  >
                    +
                  </span>
                </summary>
                <div className="v2-faq-answer grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-7 md:gap-6 md:pb-8">
                  <span aria-hidden="true" />
                  <p className="max-w-[54ch] text-[0.95rem] leading-[1.7] text-[color:var(--v2-ink-soft)]">
                    {item.answer}
                  </p>
                </div>
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
            15 jours pour découvrir tout le parcours, sans carte bancaire.
          </p>
        </Reveal>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="close-signup"
            className="v2-btn v2-btn-primary v2-btn-lg w-full sm:w-auto"
          >
            Essayer gratuitement
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
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

const footerColumns = [
  {
    title: "Produit",
    links: [
      { href: "/osteopathe-animalier", label: "Ostéopathe animalier" },
      {
        href: "/logiciel-osteopathe-animalier",
        label: "Logiciel ostéopathe animalier",
      },
      {
        href: "/compte-rendu-osteopathe-animalier",
        label: "Compte rendu propriétaire",
      },
      {
        href: "/modele-compte-rendu-osteopathe-animalier",
        label: "Modèle de compte rendu",
      },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
      { href: "/blog", label: "Blog ostéopathe animalier" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/comparatifs", label: "Comparatifs" },
      { href: "/alternatives/animalib", label: "Alternative Animalib" },
      { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
      { href: "/alternatives/mytour", label: "Alternative MyTour" },
      { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
      { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
      { href: DEMO_URL, label: "Démo" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/privacy", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
    ],
  },
] as const;

export function V2Footer() {
  return (
    <footer className="border-t border-[color:var(--v2-line)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.1fr_1.6fr_0.6fr]">
          <div>
            <Link
              href="/"
              className="v2-display flex min-h-11 items-center gap-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]"
            >
              <Image
                src="/brand/biume-logo.svg"
                alt=""
                width={32}
                height={32}
                className="size-8"
              />
              Biume<span className="text-[color:var(--v2-accent)]">.</span>
            </Link>
            <p className="mt-4 max-w-[30ch] text-[0.9rem] leading-[1.6] text-[color:var(--v2-ink-soft)]">
              Le compte rendu propriétaire et le suivi post-séance pour les
              ostéopathes animaliers.
            </p>
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`Pied de page — ${column.title}`}>
              <p className="v2-eyebrow">{column.title}</p>
              <ul
                className={`mt-5 gap-x-8 gap-y-3 ${
                  column.title === "Produit" ? "grid sm:grid-cols-2" : "space-y-3"
                }`}
              >
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
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
        </div>
      </div>
    </footer>
  );
}
