import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardPenLine,
  FileCheck2,
  FileText,
  Mic,
  Send,
} from "lucide-react";
import { Hanken_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-v3",
  display: "swap",
});

const demoUrl = "https://cal.com/mathieu-chambaud-biume";

const navItems = [
  { href: "#fonctionnement", label: "Le parcours" },
  { href: "#controle", label: "Votre contrôle" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

function PrimaryLink({
  children,
  className = "",
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`v3-action v3-button v3-button-dark ${className}`}>
      {children}
    </Link>
  );
}

function BiumeMark() {
  return (
    <Link
      href="/v3"
      className="inline-flex min-h-11 items-center gap-2.5 rounded-full pr-2 text-[0.98rem] font-semibold tracking-[-0.03em] text-[color:var(--v3-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v3-violet)]"
      aria-label="Biume, accueil de la variante V3"
    >
      <Image
        src="/brand/biume-logo.svg"
        alt=""
        width={32}
        height={32}
        className="size-8"
        priority
      />
      Biume
    </Link>
  );
}

function V3Header() {
  return (
    <header className="v3-header">
      <a href="#contenu" className="v3-skip-link">
        Aller au contenu
      </a>
      <div className="mx-auto flex min-h-[76px] max-w-[1200px] items-center px-5 sm:px-8">
        <BiumeMark />
        <nav aria-label="Navigation principale" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a className="v3-nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={webAppPath("/signin")}
            prefetch={false}
            className="v3-nav-link hidden sm:inline-flex"
          >
            Connexion
          </Link>
          <PrimaryLink
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="v3-header-signup"
            className="min-h-11 px-4 text-sm"
          >
            Essayer gratuitement
          </PrimaryLink>
        </div>
      </div>
    </header>
  );
}

function ProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`v3-product-preview ${compact ? "v3-product-preview-compact" : ""}`}
      aria-label="Aperçu de la transformation d'une note en compte rendu"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--v3-line)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="v3-icon-chip" aria-hidden="true">
            <ClipboardPenLine className="size-4" strokeWidth={1.7} />
          </span>
          <span className="text-sm font-semibold tracking-[-0.02em]">
            Séance de Luma
          </span>
        </div>
        <span className="v3-draft-status">À relire</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,0.84fr)_28px_minmax(0,1.16fr)] sm:items-center sm:p-5">
        <article className="v3-note-sheet">
          <p className="v3-ui-label">Vos observations</p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--v3-muted)]">
            Jument plus libre à droite. Tension relâchée sur l&apos;encolure.
            Marcher tranquillement aujourd&apos;hui.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[color:var(--v3-violet)]">
            <Mic className="size-3.5" strokeWidth={1.8} />
            Dictée enregistrée
          </div>
        </article>
        <ArrowRight
          aria-hidden="true"
          className="mx-auto hidden size-5 text-[color:var(--v3-violet)] sm:block"
          strokeWidth={1.5}
        />
        <article className="v3-report-sheet">
          <div className="flex items-center justify-between gap-3">
            <p className="v3-ui-label">Compte rendu propriétaire</p>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[color:var(--v3-green-ink)]">
              <CheckCircle2 className="size-3.5" strokeWidth={1.8} />
              Prêt
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--v3-ink)]">
            Aujourd&apos;hui, Luma a retrouvé plus de liberté dans ses mouvements.
            Prévoyez une marche douce pour accompagner ce relâchement.
          </p>
          <div className="mt-4 h-1 w-[72%] rounded-full bg-[color:var(--v3-violet-soft)]" />
          <div className="mt-2 h-1 w-[48%] rounded-full bg-[color:var(--v3-violet-soft)]" />
        </article>
      </div>
    </div>
  );
}

function V3Hero() {
  return (
    <section className="v3-hero" aria-labelledby="v3-hero-title">
      <div className="v3-hero-inner mx-auto max-w-[1200px] px-5 pb-20 pt-16 text-center sm:px-8 lg:pb-28 lg:pt-24">
        <div className="v3-enter v3-enter-first relative z-10 mx-auto max-w-[44rem]">
          <p className="v3-hero-kicker">
            Pour les ostéopathes animaliers indépendants
          </p>
          <h1
            id="v3-hero-title"
            className="mx-auto mt-6 max-w-[11ch] text-[clamp(3.5rem,7.4vw,6.25rem)] font-semibold leading-[0.9] tracking-[-0.052em] text-white [text-wrap:balance]"
          >
            Vos notes gardent votre regard.
          </h1>
          <p className="mx-auto mt-6 max-w-[50ch] text-[1.05rem] leading-7 text-white/90 [text-wrap:pretty]">
            Biume prépare un compte rendu clair à partir de vos observations.
            Vous le relisez, l&apos;adaptez et choisissez le moment de l&apos;envoyer.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <PrimaryLink
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="v3-hero-signup"
              className="min-h-12 px-6"
            >
              Préparer mon premier compte rendu
            </PrimaryLink>
            <p className="text-sm text-white/80">
            15 jours d&apos;essai · Sans carte bancaire
            </p>
          </div>
        </div>
        <div className="v3-hero-preview v3-enter v3-enter-second relative mx-auto mt-14 max-w-[50rem] text-left lg:mt-16">
          <ProductPreview />
          <div className="v3-float-note" aria-hidden="true">
            <span className="v3-float-note-icon">
              <FileCheck2 className="size-4" strokeWidth={1.6} />
            </span>
            <span>
              <strong>Votre version</strong>
              <small>prête à être validée</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const benefits = [
  {
    number: "01",
    title: "Captez l’essentiel, pendant qu’il est frais.",
    body: "Une observation dictée ou notée après la séance suffit pour retrouver les détails qui comptent.",
    icon: Mic,
  },
  {
    number: "02",
    title: "Transformez sans simplifier votre métier.",
    body: "Biume propose une base lisible pour le propriétaire, sans effacer votre précision ni votre vocabulaire.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Décidez avant que le document parte.",
    body: "Vous corrigez, validez et choisissez l’envoi. Le compte rendu final reste entièrement le vôtre.",
    icon: Send,
  },
] as const;

function V3Journey() {
  return (
    <section id="fonctionnement" className="v3-section" aria-labelledby="v3-journey-title">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="border-t border-[color:var(--v3-line)] pt-20 lg:pt-28">
          <div className="mx-auto max-w-[42rem] text-center">
            <p className="v3-section-label">Du terrain au propriétaire</p>
            <h2
              id="v3-journey-title"
              className="mx-auto mt-5 max-w-[14ch] text-[clamp(2.55rem,4.7vw,4.45rem)] font-semibold leading-[0.95] tracking-[-0.048em] [text-wrap:balance]"
            >
              Un compte rendu qui suit vraiment la séance.
            </h2>
          </div>
          <div className="v3-journey-list mx-auto mt-14">
            {benefits.map((benefit, index) => (
              <article key={benefit.number} className="v3-journey-item">
                <div className="flex items-start gap-5 sm:gap-7">
                  <span className="v3-step-number">{benefit.number}</span>
                  <div className="min-w-0 flex-1">
                    <benefit.icon
                      aria-hidden="true"
                      className="size-5 text-[color:var(--v3-violet)]"
                      strokeWidth={1.5}
                    />
                    <h3 className="mt-5 max-w-[22ch] text-[1.35rem] font-semibold leading-tight tracking-[-0.03em]">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 max-w-[53ch] text-[0.98rem] leading-7 text-[color:var(--v3-muted)]">
                      {benefit.body}
                    </p>
                  </div>
                </div>
                {index < benefits.length - 1 ? <div className="v3-journey-rule" /> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudioPreview() {
  const bars = [22, 34, 17, 39, 26, 49, 32, 21, 42, 29, 46, 18, 37, 28, 45];

  return (
    <div className="v3-audio-card" aria-label="Aperçu d'une note vocale de séance">
      <div className="flex items-center gap-3">
        <span className="v3-play-button" aria-hidden="true">
          <span className="ml-0.5 block size-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-white" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em]">Observation vocale</p>
          <p className="mt-0.5 text-xs text-[color:var(--v3-muted)]">Séance de Nox · 00:42</p>
        </div>
      </div>
      <div className="mt-7 flex h-12 items-center gap-1" aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="v3-wave-bar"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}

function V3Proof() {
  return (
    <section className="v3-section pb-24 pt-0 lg:pb-32" aria-labelledby="v3-proof-title">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="v3-proof-main">
          <div className="max-w-[34rem]">
            <p className="v3-section-label">Une preuve dans le produit</p>
            <h2
              id="v3-proof-title"
              className="mt-5 text-[clamp(2.2rem,4.2vw,3.8rem)] font-semibold leading-[0.97] tracking-[-0.045em] [text-wrap:balance]"
            >
              La voix du praticien, puis une version claire pour le propriétaire.
            </h2>
            <p className="mt-5 max-w-[56ch] leading-7 text-[color:var(--v3-muted)]">
              Le produit ne remplace pas la séance. Il garde le fil entre ce que
              vous avez observé et ce que le propriétaire doit comprendre.
            </p>
          </div>
          <div className="mt-11 max-w-[31rem]">
            <AudioPreview />
          </div>
        </div>
        <div className="v3-proof-side">
          <p className="v3-ui-label">Une réponse sans ambiguïté</p>
          <blockquote className="mt-7 text-[1.72rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[color:var(--v3-ink)]">
            « Biume prépare. Vous gardez la main. »
          </blockquote>
          <div className="mt-auto border-t border-[color:var(--v3-line)] pt-6">
            <div className="flex gap-3">
              <span className="v3-icon-chip v3-icon-chip-green" aria-hidden="true">
                <Check className="size-4" strokeWidth={2} />
              </span>
              <p className="text-sm leading-6 text-[color:var(--v3-muted)]">
                Rien n&apos;est envoyé sans votre validation explicite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V3Control() {
  return (
    <section id="controle" className="v3-control-section" aria-labelledby="v3-control-title">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="v3-section-label">Votre contrôle est visible</p>
          <h2
            id="v3-control-title"
            className="mx-auto mt-5 max-w-[13ch] text-[clamp(2.55rem,4.5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.048em] [text-wrap:balance]"
          >
            Une préparation, jamais un pilote automatique.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] leading-7 text-[color:var(--v3-muted)]">
            Votre expertise n&apos;est pas une étape à contourner. Elle est le dernier
            geste du parcours Biume.
          </p>
        </div>
        <div className="v3-control-demo mx-auto mt-14 max-w-[42rem]">
          <div className="flex items-center justify-between border-b border-[color:var(--v3-line)] px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold">Compte rendu de Nox</p>
              <p className="mt-0.5 text-xs text-[color:var(--v3-muted)]">Après votre relecture</p>
            </div>
            <span className="v3-draft-status">Modifiable</span>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-sm leading-7 text-[color:var(--v3-muted)]">
              Les mouvements de Nox sont plus souples aujourd&apos;hui. Une courte
              sortie en main permettra de consolider ce relâchement.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[color:var(--v3-violet)] bg-[color:var(--v3-violet-soft)] p-3 text-sm font-medium">
              <ClipboardPenLine className="size-4 shrink-0 text-[color:var(--v3-violet)]" strokeWidth={1.8} />
              <span>Votre modification est intégrée.</span>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--v3-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--v3-green-ink)]">
                <CheckCircle2 className="size-4" strokeWidth={1.8} />
                Prêt lorsque vous l&apos;êtes
              </span>
              <button type="button" className="v3-action v3-send-button">
                Envoyer au propriétaire
                <Send className="size-3.5" strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V3Pricing() {
  return (
    <section id="tarifs" className="v3-section v3-pricing-section" aria-labelledby="v3-pricing-title">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="v3-section-label">Une formule simple</p>
          <h2
            id="v3-pricing-title"
            className="mt-5 max-w-[10ch] text-[clamp(2.55rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.048em] [text-wrap:balance]"
          >
            Tout le parcours, sans module caché.
          </h2>
        </div>
        <div className="v3-price-panel">
          <div className="flex flex-col gap-6 border-b border-[color:var(--v3-line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="v3-ui-label">Formule Indépendant</p>
              <p className="mt-4 text-[clamp(3rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.055em]">
                24,99 €
                <span className="ml-2 text-base font-medium tracking-[-0.02em] text-[color:var(--v3-muted)]">/ mois</span>
              </p>
              <p className="mt-2 text-sm text-[color:var(--v3-muted)]">facturé à l&apos;année · ou 29,99 € sans engagement</p>
            </div>
            <PrimaryLink
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="v3-pricing-signup"
              className="min-h-12 px-6"
            >
              Essayer gratuitement
            </PrimaryLink>
          </div>
          <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              "Compte rendu propriétaire structuré",
              "Validation passage par passage",
              "Export PDF professionnel",
              "Suivi après séance",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6">
                <Check className="mt-1 size-3.5 shrink-0 text-[color:var(--v3-green)]" strokeWidth={2.2} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function V3Close() {
  return (
    <section className="px-5 pb-8 sm:px-8 sm:pb-12">
      <div className="v3-close mx-auto max-w-[1200px]">
        <div>
          <p className="text-sm font-medium text-white/65">Biume, après chaque séance</p>
          <h2 className="mt-5 max-w-[12ch] text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[0.94] tracking-[-0.052em] text-white [text-wrap:balance]">
            Faites partir un compte rendu qui vous ressemble.
          </h2>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row lg:justify-self-end">
          <PrimaryLink
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="v3-close-signup"
            className="v3-button-light min-h-12 px-6"
          >
            Commencer gratuitement
            <ArrowUpRight className="size-4" strokeWidth={1.7} />
          </PrimaryLink>
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="v3-action v3-close-demo"
          >
            Demander une démo
          </a>
        </div>
      </div>
    </section>
  );
}

function V3Footer() {
  return (
    <footer className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 text-sm text-[color:var(--v3-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <BiumeMark />
      <p>De vos notes au propriétaire, sans perdre votre regard métier.</p>
    </footer>
  );
}

export function V3Landing() {
  return (
    <div className={`${hanken.variable} v3 min-h-[100dvh] overflow-x-clip`}>
      <V3Header />
      <main id="contenu" tabIndex={-1}>
        <V3Hero />
        <V3Journey />
        <V3Proof />
        <V3Control />
        <V3Pricing />
        <V3Close />
      </main>
      <V3Footer />
    </div>
  );
}
