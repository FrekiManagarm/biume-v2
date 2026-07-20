import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { Reveal, RuleDraw } from "./reveal";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const included = [
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

export function V2Pricing() {
  return (
    <section
      id="tarifs"
      aria-labelledby="v2-tarifs-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="flex items-baseline gap-4 md:gap-6">
            <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-accent-deep)]">
              Nº 06
            </p>
            <RuleDraw className="h-px flex-1 self-center bg-[color:var(--v2-line)]" />
            <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]">
              Les conditions
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="v2-mono text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]">
                Formule Indépendant
              </p>
              <h2
                id="v2-tarifs-title"
                className="v2-display mt-4 max-w-[14ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
              >
                Tout le parcours.{" "}
                <em className="text-[color:var(--v2-accent-deep)]">
                  Un seul abonnement.
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-10 border-t border-[color:var(--v2-line-strong)]">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 border-b border-[color:var(--v2-line)] py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] bg-[color:var(--v2-accent)]"
                    />
                    <span className="text-[0.95rem] leading-6 text-[color:var(--v2-ink)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:pt-2">
            <div className="border border-[color:var(--v2-line-strong)] bg-[color:var(--v2-sheet)] p-7 md:p-10">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <p className="v2-display text-[clamp(3rem,6vw,4.8rem)] font-medium leading-none tracking-[-0.02em] text-[color:var(--v2-ink)]">
                  24,99&nbsp;€
                </p>
                <p className="v2-mono text-[0.7rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-soft)]">
                  par mois, facturé annuellement
                </p>
              </div>
              <p className="v2-mono mt-3 text-[0.7rem] leading-5 tracking-[0.02em] text-[color:var(--v2-ink-faint)]">
                299,88 € facturés une fois par an — ou 29,99 € par mois,
                résiliable en fin de période.
              </p>

              <RuleDraw className="mt-8 h-px bg-[color:var(--v2-line)]" />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={webAppPath("/signup")}
                  data-conversion="pricing-signup"
                  className="inline-flex min-h-12 items-center justify-center bg-[color:var(--v2-ink)] px-7 text-sm font-semibold text-[color:var(--v2-paper)] transition-transform duration-200 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)] active:translate-y-0 active:scale-[0.98]"
                >
                  Essayer gratuitement
                </a>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion="pricing-demo"
                  className="inline-flex min-h-12 items-center justify-center border border-[color:var(--v2-line-strong)] px-7 text-sm font-semibold text-[color:var(--v2-ink)] transition-colors duration-200 hover:border-[color:var(--v2-accent-deep)] hover:text-[color:var(--v2-accent-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)] active:scale-[0.98]"
                >
                  Demander une démo
                </a>
              </div>
              <p className="v2-mono mt-6 text-[0.7rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
                15 jours d'essai — sans carte bancaire
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

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
    <section
      id="questions"
      aria-labelledby="v2-questions-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="flex items-baseline gap-4 md:gap-6">
            <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-accent-deep)]">
              Nº 07
            </p>
            <RuleDraw className="h-px flex-1 self-center bg-[color:var(--v2-line)]" />
            <p className="v2-mono shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]">
              Questions ouvertes
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <h2
                id="v2-questions-title"
                className="v2-display max-w-[14ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.015em] text-[color:var(--v2-ink)]"
              >
                Les questions{" "}
                <em className="text-[color:var(--v2-accent-deep)]">
                  qu'on nous pose.
                </em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[42ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
                Une question reste ouverte ?{" "}
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-link font-semibold text-[color:var(--v2-ink)]"
                >
                  Demandez une démo
                </a>{" "}
                ou consultez la{" "}
                <Link
                  href="/privacy"
                  className="v2-link font-semibold text-[color:var(--v2-ink)]"
                >
                  page confidentialité
                </Link>
                .
              </p>
            </Reveal>
          </div>

          <div className="border-t border-[color:var(--v2-line-strong)]">
            {faqItems.map((item, index) => (
              <Reveal key={item.question} delay={0.05 * index} y={16}>
                <details className="group border-b border-[color:var(--v2-line)]">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base font-semibold leading-7 text-[color:var(--v2-ink)] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)] [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="v2-display flex size-8 shrink-0 items-center justify-center border border-[color:var(--v2-line)] text-lg leading-none text-[color:var(--v2-accent-deep)] transition-transform duration-300 ease-out group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[64ch] pb-5 text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function V2Close() {
  return (
    <section
      aria-labelledby="v2-close-title"
      className="border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-32">
        <Reveal>
          <p className="v2-mono text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-accent-deep)]">
            Dernière page
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="v2-close-title"
            className="v2-display mt-6 max-w-[13ch] text-[clamp(2.8rem,6vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.02em] text-[color:var(--v2-ink)]"
          >
            Préparez votre prochain{" "}
            <em className="text-[color:var(--v2-accent-deep)]">
              compte rendu.
            </em>
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-7 max-w-[46ch] text-[0.95rem] leading-7 text-[color:var(--v2-ink-soft)]">
            15 jours d'essai gratuit, sans carte bancaire. Vous relisez, vous
            validez, et le propriétaire reçoit une trace claire de votre
            travail.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={webAppPath("/signup")}
              data-conversion="final-signup"
              className="inline-flex min-h-12 items-center justify-center bg-[color:var(--v2-ink)] px-8 text-sm font-semibold text-[color:var(--v2-paper)] transition-transform duration-200 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)] active:translate-y-0 active:scale-[0.98]"
            >
              Essayer gratuitement
            </a>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="final-demo"
              className="inline-flex min-h-12 items-center justify-center border border-[color:var(--v2-line-strong)] px-8 text-sm font-semibold text-[color:var(--v2-ink)] transition-colors duration-200 hover:border-[color:var(--v2-accent-deep)] hover:text-[color:var(--v2-accent-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)] active:scale-[0.98]"
            >
              Demander une démo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const footerColumns = [
  {
    title: "Produit",
    links: [
      { href: "#transformation", label: "La transformation" },
      { href: "#controle", label: "Le contrôle" },
      { href: "#suivi", label: "La continuité" },
      { href: "#tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/blog", label: "Blog ostéopathe animalier" },
      {
        href: "/compte-rendu-osteopathe-animalier",
        label: "Compte rendu propriétaire",
      },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
      { href: DEMO_URL, label: "Demander une démo" },
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
    <footer className="border-t border-[color:var(--v2-line-strong)]">
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,auto)] md:gap-14">
          <div>
            <p className="v2-display text-[1.4rem] font-medium tracking-[-0.01em] text-[color:var(--v2-ink)]">
              Biume<span className="text-[color:var(--v2-accent)]">.</span>
            </p>
            <p className="mt-4 max-w-[36ch] text-sm leading-6 text-[color:var(--v2-ink-soft)]">
              Le compte rendu propriétaire et le suivi post-séance, pour les
              ostéopathes animaliers indépendants.
            </p>
            <p className="v2-mono mt-6 text-[0.65rem] uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
              Revue du compte rendu — Édition Nº 02
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`Pied de page — ${column.title}`}>
              <h3 className="v2-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)]">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="v2-link inline-flex min-h-9 items-center text-sm text-[color:var(--v2-ink-soft)]"
                        >
                          {link.label}
                        </a>
                      ) : link.href.startsWith("#") ? (
                        <a
                          href={link.href}
                          className="v2-link inline-flex min-h-9 items-center text-sm text-[color:var(--v2-ink-soft)]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="v2-link inline-flex min-h-9 items-center text-sm text-[color:var(--v2-ink-soft)]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-4 border-t border-[color:var(--v2-line)] pt-6">
          <p className="v2-mono text-[0.65rem] uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
            © 2026 Biume
          </p>
          <Link
            href="/"
            className="v2-link v2-mono text-[0.65rem] uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]"
          >
            Voir l'édition Nº 01
          </Link>
        </div>
      </div>
    </footer>
  );
}
