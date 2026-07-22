import Image from "next/image";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import {
  ArrowRight,
  Check,
  ClipboardPenLine,
  FileText,
  Send,
  ShieldCheck,
} from "lucide-react";

import { webAppPath } from "../../lib/web-app-url";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const v3Sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-v3-sans",
});

const journeyStages = [
  {
    id: "observe",
    label: "01 — Observer",
    title: "Votre observation reste le point de départ.",
    detail:
      "Dictée ou note courte : vous posez les éléments de la séance pendant qu’ils sont encore précis.",
    sample: "Mobilité plus libre à droite. Marche douce aujourd’hui.",
  },
  {
    id: "prepare",
    label: "02 — Préparer",
    title: "Biume rend le message lisible.",
    detail:
      "Une base de compte rendu claire pour le propriétaire, construite à partir de votre regard métier.",
    sample: "Luma a retrouvé plus de liberté dans ses mouvements.",
  },
  {
    id: "validate",
    label: "03 — Valider",
    title: "La dernière décision vous appartient.",
    detail:
      "Vous relisez, adaptez et choisissez le moment de l’envoi. Rien ne part sans vous.",
    sample: "Votre version est prête à être validée.",
  },
] as const;

const pricingInclusions = [
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

const focusClassName = "v3-focus-ring focus-visible:outline-2 focus-visible:outline-offset-4";

function V3Header() {
  return (
    <header className="v3-header">
      <a className={`v3-skip-link ${focusClassName}`} href="#contenu">
        Aller au contenu
      </a>
      <div className="v3-header-inner">
        <Link
          aria-label="Biume, accueil"
          className={`v3-brand ${focusClassName}`}
          href="/"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span>Biume</span>
        </Link>
        <nav aria-label="Navigation principale" className="v3-nav">
          <a className={focusClassName} href="#fonctionnement">
            Fonctionnement
          </a>
          <a className={focusClassName} href="#controle">
            Votre contrôle
          </a>
          <a className={focusClassName} href="#tarifs">
            Tarifs
          </a>
        </nav>
        <div className="v3-header-actions">
          <a className={focusClassName} href={webAppPath("/signin")}>
            Connexion
          </a>
          <a className={`v3-header-signup ${focusClassName}`} href={webAppPath("/signup")}>
            Essayer Biume
          </a>
        </div>
      </div>
    </header>
  );
}

function ClinicalHero() {
  return (
    <section aria-labelledby="v3-hero-title" className="v3-hero">
      <div className="v3-hero-copy">
        <p className="v3-eyebrow">Pour les ostéopathes animaliers indépendants</p>
        <h1 id="v3-hero-title">
          <span className="v3-heading-reveal">Vos notes gardent votre regard.</span>
        </h1>
        <p className="v3-hero-subhead">
          Biume accompagne les ostéopathes animaliers indépendants, de leurs
          notes de séance à un compte rendu clair pour le propriétaire.
        </p>
        <p className="v3-hero-assurance">Vous relisez, adaptez et validez avant chaque partage.</p>
        <div className="v3-hero-actions">
          <a
            className={`v3-primary-action ${focusClassName}`}
            href={webAppPath("/signup")}
            data-conversion="v3-hero-signup"
          >
            Préparer mon premier compte rendu
            <ArrowRight aria-hidden="true" size={18} />
          </a>
          <a className={`v3-secondary-action ${focusClassName}`} href="#fonctionnement">
            Voir le parcours
          </a>
        </div>
      </div>
      <aside aria-label="Aperçu de séance" className="v3-hero-preview v3-scan-frame">
        <div className="v3-preview-heading">
          <ClipboardPenLine aria-hidden="true" size={20} />
          <span>Note de séance</span>
          <span className="v3-static-status">À préparer</span>
        </div>
        <p>Mobilité plus libre à droite. Marche douce aujourd’hui.</p>
        <span className="v3-static-connector" aria-hidden="true" />
        <div className="v3-preview-heading">
          <FileText aria-hidden="true" size={20} />
          <span>Compte rendu propriétaire</span>
        </div>
        <p>Une version claire, prête à être relue et adaptée.</p>
      </aside>
    </section>
  );
}

function CareJourney() {
  return (
    <section
      id="fonctionnement"
      aria-label="Parcours de la note au compte rendu"
      className="v3-journey"
    >
      <div className="v3-section-intro">
        <p className="v3-eyebrow">Un parcours court, votre regard à chaque étape</p>
        <h2><span className="v3-heading-reveal">De l’observation à votre validation.</span></h2>
      </div>
      <div className="v3-journey-track">
        {journeyStages.map((stage) => (
          <article className="v3-journey-card" key={stage.id}>
            <p className="v3-stage-label">{stage.label}</p>
            <h3>{stage.title}</h3>
            <p>{stage.detail}</p>
            <div className="v3-stage-sample">
              <span>Exemple</span>
              <p>{stage.sample}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductWorkbench() {
  return (
    <section id="produit" aria-labelledby="v3-workbench-title" className="v3-workbench">
      <div className="v3-section-intro">
        <p className="v3-eyebrow">Dans Biume</p>
        <h2 id="v3-workbench-title"><span className="v3-heading-reveal">Une démonstration de votre espace de travail.</span></h2>
      </div>
      <div className="v3-workbench-demo" aria-label="Démonstration statique du produit">
        <div className="v3-demo-toolbar">
          <span>Séance de Luma</span>
          <span className="v3-static-status">Brouillon</span>
        </div>
        <div className="v3-demo-columns">
          <article>
            <div className="v3-demo-label">
              <ClipboardPenLine aria-hidden="true" size={18} />
              <h3>Votre note</h3>
            </div>
            <p>Mobilité plus libre à droite. Marche douce aujourd’hui.</p>
          </article>
          <article>
            <div className="v3-demo-label">
              <FileText aria-hidden="true" size={18} />
              <h3>Version propriétaire</h3>
            </div>
            <p>Luma a retrouvé plus de liberté dans ses mouvements.</p>
          </article>
        </div>
        <div className="v3-demo-footer">
          <span>Préparation en cours</span>
          <span className="v3-static-affordance">Relire le compte rendu</span>
        </div>
      </div>
    </section>
  );
}

function ControlProof() {
  return (
    <section id="controle" aria-labelledby="v3-control-title" className="v3-control">
      <div className="v3-section-intro">
        <p className="v3-eyebrow">Votre contrôle</p>
        <h2 id="v3-control-title"><span className="v3-heading-reveal">La validation reste entre vos mains.</span></h2>
        <p>
          Biume prépare une base. Vous relisez, adaptez, validez et choisissez
          vous-même si et quand le compte rendu est envoyé.
        </p>
      </div>
      <ul className="v3-control-list">
        <li>
          <Check aria-hidden="true" size={20} />
          <span>Relire chaque passage avant validation</span>
        </li>
        <li>
          <Check aria-hidden="true" size={20} />
          <span>Adapter le message à votre séance</span>
        </li>
        <li>
          <ShieldCheck aria-hidden="true" size={20} />
          <span>Choisir le moment de l’envoi</span>
        </li>
      </ul>
      <aside className="v3-validation-proof" aria-label="État de validation">
        <Send aria-hidden="true" size={20} />
        <div>
          <strong>Prêt à être validé</strong>
          <p>Rien ne part sans votre décision.</p>
        </div>
      </aside>
    </section>
  );
}

function PricingPanel() {
  return (
    <section id="tarifs" aria-labelledby="v3-pricing-title" className="v3-pricing">
      <div className="v3-section-intro">
        <p className="v3-eyebrow">Tarifs</p>
        <h2 id="v3-pricing-title"><span className="v3-heading-reveal">Un abonnement pour suivre votre rythme.</span></h2>
      </div>
      <article className="v3-pricing-card">
        <p className="v3-price">24,99 € / mois</p>
        <p>Facturé annuellement.</p>
        <p className="v3-price-equivalent">29,99 € sans engagement</p>
        <ul>
          {pricingInclusions.map((inclusion) => (
            <li key={inclusion}>
              <Check aria-hidden="true" size={18} />
              {inclusion}
            </li>
          ))}
        </ul>
        <a
          className={`v3-primary-action ${focusClassName}`}
          href={webAppPath("/signup")}
          data-conversion="v3-pricing-signup"
        >
          Choisir Biume
          <ArrowRight aria-hidden="true" size={18} />
        </a>
      </article>
    </section>
  );
}

function V3Close() {
  return (
    <section aria-labelledby="v3-close-title" className="v3-close">
      <div>
        <p className="v3-eyebrow">Prêt pour la prochaine séance</p>
        <h2 id="v3-close-title"><span className="v3-heading-reveal">Gardez la main sur chaque compte rendu.</span></h2>
      </div>
      <div className="v3-close-actions">
        <a className={`v3-primary-action ${focusClassName}`} href={webAppPath("/signup")}>
          Essayer Biume
          <ArrowRight aria-hidden="true" size={18} />
        </a>
        <a
          className={`v3-secondary-action ${focusClassName}`}
          href={DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Demander une démo
        </a>
      </div>
    </section>
  );
}

function V3Footer() {
  return (
    <footer className="v3-footer">
      <Link aria-label="Biume, accueil" className={focusClassName} href="/">
        <Image src="/brand/biume-logo.svg" alt="" width={24} height={24} />
        <span>Biume</span>
      </Link>
      <p>Des notes de séance à un compte rendu que vous validez.</p>
    </footer>
  );
}

export function V3Landing() {
  return (
    <div className={`v3 ${v3Sans.variable} min-h-[100dvh] overflow-x-clip`}>
      <V3Header />
      <main id="contenu" tabIndex={-1}>
        <ClinicalHero />
        <CareJourney />
        <ProductWorkbench />
        <ControlProof />
        <PricingPanel />
        <V3Close />
      </main>
      <V3Footer />
    </div>
  );
}
