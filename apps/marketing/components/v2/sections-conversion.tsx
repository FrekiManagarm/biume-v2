import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { SectionIntro } from "./heading";
import { Reveal } from "./reveal";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const included = [
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

function IncludedCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`mt-0.5 size-4 shrink-0 ${className}`}
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

export function V2Pricing() {
  return (
    <section
      id="tarifs"
      aria-labelledby="v2-tarifs-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <SectionIntro eyebrow="Tarifs" title="Une seule formule. Tout le parcours." id="v2-tarifs-title">
          <p>
            Pensée pour un praticien indépendant : pas de module caché, pas de
            tarif au rapport. L'essai gratuit permet de valider sur vos vraies
            séances.
          </p>
        </SectionIntro>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] bg-[color:var(--v2-grape)] p-8 text-white shadow-[0_32px_64px_-28px_hsl(251_45%_22%/0.6)] md:p-10">
            <p className="v2-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/70">
              Formule Indépendant
            </p>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="v2-display text-[clamp(2.6rem,4vw,3.4rem)] font-semibold tracking-[-0.03em] text-white">
                24,99&nbsp;€
              </span>
              <span className="text-[0.95rem] text-white/70">
                / mois, facturé annuellement
              </span>
            </p>
            <p className="v2-mono mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-white/55">
              Soit 299,88&nbsp;€ par an — ou 29,99&nbsp;€ en mensuel
            </p>

            <ul className="mt-8 space-y-3 border-t border-white/15 pt-8">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[0.92rem] leading-6 text-white"
                >
                  <IncludedCheck className="text-white/80" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="pricing-signup"
                className="v2-btn v2-btn-invert flex-1"
              >
                Commencer l'essai gratuit
              </Link>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="pricing-demo"
                className="v2-btn v2-btn-outline-invert flex-1"
              >
                Demander une démo
              </a>
            </div>
            <p className="v2-mono mt-5 text-center text-[0.68rem] uppercase tracking-[0.14em] text-white/55">
              15 jours d'essai · Sans carte bancaire
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "Est-ce que Biume rédige le compte rendu à ma place ?",
    answer:
      "Non. Biume prépare une proposition à partir de vos observations, passage par passage. Vous relisez chaque section, vous la modifiez si besoin, et rien n'est envoyé sans votre validation explicite.",
  },
  {
    question: "Combien de temps prend un compte rendu ?",
    answer:
      "Une note courte après la séance suffit : quelques phrases dictées ou écrites. La relecture de la proposition se fait ensuite en quelques minutes, quand vous voulez.",
  },
  {
    question: "Et si le style ne me ressemble pas ?",
    answer:
      "Chaque correction remplace directement le texte du champ courant. Le compte rendu final reflète votre regard et votre vocabulaire, pas un texte générique.",
  },
  {
    question: "Que reçoit le propriétaire exactement ?",
    answer:
      "Un compte rendu structuré et lisible, à votre nom : contexte de la séance, observations expliquées en langage clair, recommandations et suite proposée. Le tout en PDF professionnel.",
  },
  {
    question: "Puis-je tester sans engagement ?",
    answer:
      "Oui. L'essai dure 15 jours, sans carte bancaire. Vous pouvez produire vos premiers comptes rendus sur de vraies séances avant de décider.",
  },
] as const;

export function V2Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="v2-faq-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <SectionIntro eyebrow="Questions" title="Les réponses avant l'essai." id="v2-faq-title" align="center" />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-[color:var(--v2-line)] rounded-2xl border border-[color:var(--v2-line)] bg-[color:var(--v2-panel)]">
          {faqItems.map((item) => (
            <details key={item.question} className="group px-6 py-5 md:px-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-[0.98rem] font-semibold tracking-[-0.005em] text-[color:var(--v2-ink)] [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="v2-display shrink-0 text-[1.4rem] font-normal leading-none text-[color:var(--v2-accent)] transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[62ch] text-[0.92rem] leading-7 text-[color:var(--v2-ink-soft)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function V2Close() {
  return (
    <section
      aria-labelledby="v2-close-title"
      className="relative overflow-hidden bg-[color:var(--v2-pine)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(58% 62% at 50% 0%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-5 py-24 text-center md:px-8 md:py-32">
        <Reveal>
          <p className="v2-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/70">
            Essai gratuit
          </p>
          <h2
            id="v2-close-title"
            className="v2-display mx-auto mt-5 max-w-[18ch] text-[clamp(2.1rem,3.6vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white [text-wrap:balance]"
          >
            Préparez votre prochain compte rendu.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[1rem] leading-[1.65] text-white/75 [text-wrap:pretty]">
            Dictez vos observations de demain matin. Relisez le soir même un
            compte rendu prêt à partir — ou décidez que Biume n'est pas pour
            vous, sans rien payer.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="close-signup"
              className="v2-btn v2-btn-invert w-full sm:w-auto"
            >
              Commencer gratuitement
            </Link>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="close-demo"
              className="v2-btn v2-btn-outline-invert w-full sm:w-auto"
            >
              Demander une démo
            </a>
          </div>
          <p className="v2-mono mt-5 text-[0.68rem] uppercase tracking-[0.14em] text-white/55">
            15 jours d'essai · Sans carte bancaire
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const footerColumns = [
  {
    title: "Produit",
    links: [
      { href: "#comment-ca-marche", label: "Comment ça marche" },
      { href: "#controle", label: "Le contrôle" },
      { href: "#suivi", label: "La continuité" },
      { href: "#tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "#questions", label: "Questions" },
      { href: DEMO_URL, label: "Demander une démo", external: true },
      { href: webAppPath("/signup"), label: "Créer un compte" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/mentions-legales", label: "Mentions légales" },
      { href: "/legal/confidentialite", label: "Confidentialité" },
      { href: "/legal/cgu", label: "CGU" },
    ],
  },
] as const;

export function V2Footer() {
  return (
    <footer className="border-t border-[color:var(--v2-line)]">
      <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <p className="v2-display text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)]">
              Biume<span className="text-[color:var(--v2-accent)]">.</span>
            </p>
            <p className="mt-3 max-w-[30ch] text-[0.85rem] leading-6 text-[color:var(--v2-ink-soft)]">
              Le compte rendu propriétaire des ostéopathes animaliers, préparé
              sans effacer le regard métier.
            </p>
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="v2-mono text-[0.62rem] uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="v2-link text-[0.85rem] text-[color:var(--v2-ink-soft)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[color:var(--v2-line)] pt-6 md:flex-row md:items-center">
          <p className="v2-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
            © 2026 Biume
          </p>
          <Link
            href="/"
            className="v2-link text-[0.8rem] text-[color:var(--v2-ink-soft)]"
          >
            Retour à la version actuelle
          </Link>
        </div>
      </div>
    </footer>
  );
}
