import Link from "next/link";
import { Accordion } from "@heroui/react";

import { webAppPath } from "../../lib/web-app-url";

import { V4SessionConsole } from "./v4-session-console";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const pricingInclusions = [
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

function V4Header() {
  return (
    <header className="v4-header">
      <a className="v4-skip-link v4-focus-ring" href="#contenu">
        Aller au contenu
      </a>
      <div className="v4-header-inner">
        <Link aria-label="Biume, accueil" className="v4-brand v4-focus-ring" href="/">
          Biume
        </Link>
        <nav aria-label="Navigation principale" className="v4-nav">
          <a className="v4-focus-ring" href="#parcours">
            Parcours
          </a>
          <a className="v4-focus-ring" href="#tarifs">
            Tarifs
          </a>
        </nav>
        <div className="v4-header-actions">
          <a className="v4-focus-ring" href={webAppPath("/signin")}>
            Connexion
          </a>
          <a className="v4-action v4-focus-ring" href={webAppPath("/signup")}>
            Essayer Biume
          </a>
        </div>
      </div>
    </header>
  );
}

function V4Hero() {
  return (
    <section
      aria-labelledby="v4-hero-title"
      className="v4-hero"
      data-v4-section="hero"
    >
      <div className="v4-hero-grid">
        <div className="v4-hero-copy">
          <p className="v4-eyebrow">Le compte rendu, à votre rythme</p>
          <h1 id="v4-hero-title">Vos notes restent le point de départ.</h1>
          <p className="v4-hero-line">Préparez. Relisez. Décidez.</p>
          <p className="v4-hero-description">
            Biume vous aide à organiser votre compte rendu à partir de votre
            séance, puis vous laisse la dernière lecture avant tout partage.
          </p>
          <div className="v4-hero-actions">
            <a
              className="v4-action v4-focus-ring"
              data-conversion="v4-hero-signup"
              href={webAppPath("/signup")}
            >
              Commencer avec Biume
            </a>
            <a className="v4-secondary-action v4-focus-ring" href="#parcours">
              Voir le parcours
            </a>
          </div>
        </div>
        <V4SessionConsole />
      </div>
    </section>
  );
}

function V4ProofGrid() {
  return (
    <section
      id="parcours"
      aria-labelledby="v4-proof-title"
      className="v4-proof-grid"
    >
      <div className="v4-proof-intro">
        <p className="v4-eyebrow">Votre méthode, rendue lisible</p>
        <h2 id="v4-proof-title">Votre note reste la source.</h2>
      </div>
      <article className="v4-proof-card v4-proof-card-source">
        <p className="v4-proof-index">01</p>
        <h3>Observer</h3>
        <p>Vous posez les éléments de séance pendant qu’ils sont encore précis.</p>
      </article>
      <article className="v4-proof-card v4-proof-card-owner">
        <p className="v4-proof-index">02</p>
        <h3>Préparer</h3>
        <p>Le propriétaire reçoit une version claire, que vous pouvez relire.</p>
      </article>
      <article className="v4-proof-card v4-proof-card-decision">
        <p className="v4-proof-index">03</p>
        <h3>Décider</h3>
        <p>Rien ne part sans votre décision.</p>
      </article>
    </section>
  );
}

function V4Pricing() {
  return (
    <section
      id="tarifs"
      aria-labelledby="v4-pricing-title"
      className="v4-pricing"
      data-v4-section="pricing"
    >
      <div>
        <p className="v4-eyebrow">Tarifs</p>
        <h2 id="v4-pricing-title">Un abonnement pour vos comptes rendus.</h2>
      </div>
      <article className="v4-pricing-card">
        <p className="v4-price">24,99 € / mois</p>
        <p className="v4-price-note">Facturé annuellement.</p>
        <ul>
          {pricingInclusions.map((inclusion) => (
            <li key={inclusion}>{inclusion}</li>
          ))}
        </ul>
        <a
          className="v4-action v4-focus-ring"
          data-conversion="v4-pricing-signup"
          href={webAppPath("/signup")}
        >
          Choisir Biume
        </a>
      </article>
    </section>
  );
}

const faqItems = [
  {
    id: "validation",
    question: "Est-ce que Biume envoie le compte rendu à ma place ?",
    answer:
      "Non. Biume prépare une base et vous choisissez si, quand et dans quelle version le compte rendu est partagé.",
  },
  {
    id: "modification",
    question: "Chaque texte peut-il être modifié avant le partage ?",
    answer:
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l’envoi.",
  },
  {
    id: "owner",
    question: "Que reçoit le propriétaire ?",
    answer:
      "Le propriétaire reçoit le PDF professionnel joint à l’email que vous choisissez d’envoyer.",
  },
  {
    id: "billing",
    question: "Comment arrêter l’abonnement ?",
    answer:
      "Vous pouvez demander l’annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
  },
] as const;

function V4Faq() {
  return (
    <section
      aria-labelledby="v4-faq-kicker"
      className="v4-faq"
    >
      <div className="v4-faq-intro">
        <p className="v4-eyebrow" id="v4-faq-kicker">
          Questions fréquentes
        </p>
        <h2 id="v4-faq-title">Ce qui reste entre vos mains.</h2>
      </div>
      <Accordion className="v4-faq-list">
        {faqItems.map((item) => (
          <Accordion.Item className="v4-faq-item" id={item.id} key={item.id}>
            <Accordion.Heading className="v4-faq-heading">
              <Accordion.Trigger className="v4-faq-trigger">
                <span>{item.question}</span>
                <Accordion.Indicator className="v4-faq-indicator" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel className="v4-faq-panel">
              <Accordion.Body className="v4-faq-body">{item.answer}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}

function V4Close() {
  return (
    <section aria-labelledby="v4-close-title" className="v4-close">
      <div>
        <p className="v4-eyebrow">Pour la prochaine séance</p>
        <h2 id="v4-close-title">Gardez le dernier mot sur chaque compte rendu.</h2>
      </div>
      <div className="v4-close-actions">
        <a className="v4-action v4-focus-ring" href={webAppPath("/signup")}>
          Essayer Biume
        </a>
        <a
          className="v4-secondary-action v4-focus-ring"
          href={DEMO_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Demander une démo
        </a>
      </div>
    </section>
  );
}

function V4Footer() {
  return (
    <footer className="v4-footer">
      <Link aria-label="Biume, accueil" className="v4-brand v4-focus-ring" href="/">
        Biume
      </Link>
      <p>Des notes de séance à un compte rendu que vous relisez.</p>
      <div>
        <a className="v4-focus-ring" href={webAppPath("/signup")}>
          Créer un compte
        </a>
        <a
          className="v4-focus-ring"
          href={DEMO_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Démo
        </a>
      </div>
    </footer>
  );
}

export function V4Landing() {
  return (
    <div className="v4">
      <V4Header />
      <main id="contenu" tabIndex={-1}>
        <V4Hero />
        <V4ProofGrid />
        <V4Pricing />
        <V4Faq />
        <V4Close />
      </main>
      <V4Footer />
    </div>
  );
}
