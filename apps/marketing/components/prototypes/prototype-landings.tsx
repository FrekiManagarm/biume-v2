import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import {
  ContinuityPath,
  MagneticLink,
  ParallaxMedia,
  TransitRail,
} from "./prototype-motion";
import { NarrativeSaasSections } from "./prototype-saas-sections";

const signupUrl = webAppPath("/signup");
const demoUrl = "https://cal.com/mathieu-chambaud-biume";

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-2 size-4">
      <path d="M3.5 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Retour à l’accueil Biume" className={`transit-focus inline-flex min-h-11 items-center gap-2 text-sm font-semibold ${inverted ? "text-[#f5f3eb]" : "text-[#16322e]"}`}>
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

export function LaboratoireLanding() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#eef1ed] text-[#16322e]">
      <a className="transit-skip" href="#laboratoire-contenu">Aller au contenu</a>
      <header className="px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between border-b border-[#16322e]/20 pb-4">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#31514b] md:flex" aria-label="Navigation principale">
            <a className="transit-focus inline-flex min-h-11 items-center" href="#methode">La méthode</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#produit">Le produit</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#tarifs">Tarifs</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#faq">FAQ</a>
          </nav>
          <Link href={demoUrl} target="_blank" rel="noopener noreferrer" className="transit-focus hidden min-h-11 items-center text-sm font-semibold underline decoration-[#176a5a] underline-offset-4 md:inline-flex">
            Demander une démo
          </Link>
        </div>
      </header>

      <main id="laboratoire-contenu" tabIndex={-1}>
        <section className="px-4 pb-16 pt-5 md:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-14">
            <div className="pb-2 lg:pb-12">
              <p className="max-w-[30ch] text-sm font-semibold leading-6 text-[#176a5a]">Le compte rendu ne remplace pas votre séance. Il la prolonge.</p>
              <h1 className="mt-7 max-w-[8ch] text-balance text-[clamp(3.8rem,7.2vw,6rem)] font-semibold leading-[0.88] tracking-[-0.04em]">Les gestes en transit.</h1>
              <p className="mt-7 max-w-[43ch] text-pretty text-lg leading-8 text-[#31514b]">Biume fait passer vos observations du carnet au propriétaire avec assez de précision pour que la suite reste juste.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <PrimaryAction className="bg-[#176a5a] text-white hover:bg-[#115246]">Essayer gratuitement</PrimaryAction>
                <a href="#passage" className="transit-focus transit-action inline-flex min-h-12 items-center justify-center border border-[#16322e]/25 px-5 text-sm font-semibold hover:border-[#16322e]">
                  Voir le passage
                  <Arrow />
                </a>
              </div>
              <p className="mt-4 text-sm text-[#31514b]">15 jours gratuits · sans carte bancaire</p>
            </div>

            <div className="relative min-h-[27rem] overflow-hidden bg-[#b8c4bc] sm:min-h-[38rem] lg:min-h-[38rem]">
              <ParallaxMedia className="absolute inset-0" distance={5}>
                <Image src="/assets/images/prototypes/laboratoire-hero.webp" alt="Carnet d’observation et crayon posés sur une table de pierre" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              </ParallaxMedia>
              <p className="absolute bottom-6 left-6 max-w-[20ch] border-t border-[#eef1ed]/80 pt-3 text-sm font-medium leading-6 text-[#eef1ed] sm:bottom-8 sm:left-8">Ce que vous voyez mérite de rester vivant après le rendez-vous.</p>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-[1400px]">
            <TransitRail />
          </div>
        </section>

        <NarrativeSaasSections tone="light" />

        <section id="passage" className="border-y border-[#16322e]/20 px-4 py-20 md:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <h2 className="max-w-[10ch] text-balance text-[clamp(2.8rem,5.5vw,5.2rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Une seule séance, trois langages.</h2>
              <p className="max-w-[48ch] text-pretty text-lg leading-8 text-[#31514b]">Vos notes restent professionnelles. Biume prépare une version claire. Le propriétaire reçoit des repères qu’il peut réellement utiliser. Aucun de ces passages ne vous enlève la décision.</p>
            </div>
          </div>
        </section>

        <section id="apres" className="px-4 py-20 md:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <Image src="/assets/images/prototypes/laboratoire-followup.webp" alt="Un chien avance dans une prairie, en plein mouvement" width={1600} height={640} sizes="(min-width: 1024px) 60vw, 100vw" className="h-auto w-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-[#176a5a]">Après, le bon repère revient au bon moment.</p>
              <h2 className="mt-5 max-w-[11ch] text-balance text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.035em]">Ce qui compte ne disparaît pas.</h2>
              <p className="mt-6 max-w-[35ch] text-pretty text-lg leading-8 text-[#31514b]">Le suivi se construit sur une mémoire accessible : ce qui a été observé, ce qui a été transmis et ce qui mérite d’être revu.</p>
              <PrimaryAction className="mt-8 bg-[#16322e] text-white hover:bg-[#284b44]">Préparer mon premier suivi</PrimaryAction>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#16322e]/20 px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-sm text-[#31514b] sm:flex-row">
          <p>Biume · des notes au propriétaire, sans perdre le fil.</p>
          <Link href="/" className="transit-focus font-semibold text-[#176a5a]">Retour à Biume</Link>
        </div>
      </footer>
    </div>
  );
}

export function AfterDarkLanding() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#101d1e] text-[#f5f3eb]">
      <a className="transit-skip transit-skip-night" href="#after-dark-contenu">Aller au contenu</a>
      <header className="absolute inset-x-0 top-0 z-20 px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Brand inverted />
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex" aria-label="Navigation principale">
            <a className="transit-focus inline-flex min-h-11 items-center" href="#methode">La méthode</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#produit">Le produit</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#tarifs">Tarifs</a>
            <a className="transit-focus inline-flex min-h-11 items-center" href="#faq">FAQ</a>
            <Link href={signupUrl} prefetch={false} className="transit-focus border border-[#ef9b70] px-4 py-2 text-[#ef9b70]">Essayer</Link>
          </nav>
        </div>
      </header>

      <main id="after-dark-contenu" tabIndex={-1}>
        <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden px-4 pb-12 pt-28 md:px-6 md:pb-16 lg:px-8 lg:pb-20">
          <ParallaxMedia className="absolute inset-0 -z-20" distance={10}>
            <Image src="/assets/images/prototypes/after-dark-hero.webp" alt="Une main de praticien posée sur l’épaule d’un cheval à la tombée du jour" fill priority sizes="100vw" className="object-cover object-[61%_center]" />
          </ParallaxMedia>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,18,19,0.94),rgba(8,18,19,0.56)_45%,rgba(8,18,19,0.08)_78%)]" />
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
          <TransitRail tone="night" />
        </div>

        <NarrativeSaasSections tone="night" />

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
          <Link href="/" className="transit-focus font-semibold text-[#ef9b70]">Retour à Biume</Link>
        </div>
      </footer>
    </div>
  );
}
