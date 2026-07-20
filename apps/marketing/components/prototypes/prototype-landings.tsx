import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import {
  ContinuityPath,
  MagneticLink,
  TransitRail,
} from "./prototype-motion";
import { OrbitHeroMedia } from "./after-dark-orbit-motion";
import { NarrativeSaasSections } from "./prototype-saas-sections";

const signupUrl = webAppPath("/signup");

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-2 size-4">
      <path d="M3.5 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Brand() {
  return (
    <Link href="/" aria-label="Retour à l’accueil Biume" className="transit-focus inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#f5f3eb]">
      <Image src="/brand/biume-logo.svg" alt="" width={28} height={28} className="size-7" priority />
      Biume
    </Link>
  );
}

function PrimaryAction({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <MagneticLink href={signupUrl} dataConversion="prototype-signup" className={`transit-focus transit-action inline-flex min-h-12 items-center justify-center px-5 text-sm font-semibold ${className}`}>
      {children}
      <Arrow />
    </MagneticLink>
  );
}

export function AfterDarkLanding() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#101d1e] text-[#f5f3eb]">
      <a className="transit-skip transit-skip-night" href="#after-dark-contenu">Aller au contenu</a>
      <header className="absolute inset-x-0 top-0 z-20 px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex" aria-label="Navigation principale">
            <a className="transit-focus inline-flex min-h-11 min-w-11 items-center justify-center" href="#methode">La méthode</a>
            <a className="transit-focus inline-flex min-h-11 min-w-11 items-center justify-center" href="#produit">Le produit</a>
            <a className="transit-focus inline-flex min-h-11 min-w-11 items-center justify-center" href="#tarifs">Tarifs</a>
            <a className="transit-focus inline-flex min-h-11 min-w-11 items-center justify-center" href="#faq">FAQ</a>
            <Link href={signupUrl} prefetch={false} className="transit-focus inline-flex min-h-11 items-center border border-[#ef9b70] px-4 text-[#ef9b70]">Essayer</Link>
          </nav>
        </div>
      </header>

      <main id="after-dark-contenu" tabIndex={-1}>
        <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden px-4 pb-12 pt-28 md:px-6 md:pb-16 lg:px-8 lg:pb-20">
          <OrbitHeroMedia className="absolute inset-0 -z-20">
            <Image src="/assets/images/prototypes/after-dark-hero.webp" alt="Une main de praticien posée sur l’épaule d’un cheval à la tombée du jour" fill priority sizes="100vw" className="object-cover object-[61%_center]" />
          </OrbitHeroMedia>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#081213]/55" />
          <div aria-hidden="true" className="absolute right-4 top-28 flex items-center gap-3 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-[#ef9b70] md:right-6 lg:right-8">
            <span>01</span>
            <span className="h-px w-14 bg-[#ef9b70]" />
            <span>04</span>
          </div>
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="max-w-[30ch] text-sm font-semibold leading-6 text-[#ef9b70]">Le regard reste présent quand le propriétaire est de nouveau seul avec son animal.</p>
            <h1 className="mt-6 max-w-[7ch] text-balance text-[clamp(4rem,8vw,6rem)] font-semibold leading-[0.86] tracking-[-0.04em]">La suite commence ici.</h1>
            <p className="mt-7 max-w-[34ch] text-pretty text-lg leading-8 text-white/80">Biume transforme le geste observé en continuité compréhensible, sans transformer votre pratique en automatisme.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <PrimaryAction className="bg-[#ef9b70] text-[#101d1e] hover:bg-[#ffc19e]">Essayer gratuitement</PrimaryAction>
              <a href="#continuite" className="transit-focus transit-action inline-flex min-h-12 items-center justify-center border border-white/35 px-5 text-sm font-semibold text-white hover:border-white">Suivre le fil<Arrow /></a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <TransitRail />
        </div>

        <NarrativeSaasSections />

        <section id="continuite" className="relative overflow-hidden px-4 py-24 md:px-6 lg:px-8 lg:py-32">
          <ContinuityPath />
          <div className="relative mx-auto max-w-[1400px] pt-14">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <h2 className="max-w-[10ch] text-balance text-[clamp(2.8rem,5.4vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.038em]">Une trajectoire, pas un envoi isolé.</h2>
              <p className="max-w-[48ch] text-pretty text-lg leading-8 text-white/70">Le bon compte rendu relie la précision de votre séance à ce que le propriétaire peut observer, appliquer et vous raconter ensuite.</p>
            </div>
          </div>
        </section>

        <section id="repere" className="border-t border-white/15 bg-[#172a2b] px-4 py-20 md:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#ef9b70]">Le prochain repère</p>
              <h2 className="mt-5 max-w-[10ch] text-balance text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.035em]">Rester clair, même après le départ.</h2>
              <p className="mt-6 max-w-[36ch] text-pretty text-lg leading-8 text-white/70">Le propriétaire retrouve l’essentiel. Vous retrouvez le contexte. Le suivi garde une forme qui ne dépend pas de la mémoire de chacun.</p>
              <PrimaryAction className="mt-8 bg-[#f5f3eb] text-[#101d1e] hover:bg-white">Découvrir Biume</PrimaryAction>
            </div>
            <div className="relative min-h-[25rem] overflow-hidden border border-white/20 sm:min-h-[34rem]">
              <Image src="/assets/images/prototypes/after-dark-report-detail.webp" alt="Détail d’un document de suivi avec des repères graphiques" fill sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" />
              <p className="absolute bottom-0 left-0 max-w-[34ch] bg-[#101d1e] px-6 py-5 text-sm leading-6 text-white/80">Un message précis peut devenir un point d’appui quand la séance est déjà loin.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/15 px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-sm text-white/65 sm:flex-row">
          <p>Biume · l’observation reste disponible, le praticien reste décideur.</p>
          <Link href="/" className="transit-focus inline-flex min-h-11 items-center font-semibold text-[#ef9b70]">Retour à Biume</Link>
        </div>
      </footer>
    </div>
  );
}
