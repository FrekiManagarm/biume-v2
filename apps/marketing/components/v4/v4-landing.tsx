import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

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
        <div className="v4-console-slot" aria-label="Aperçu de séance">
          Aperçu de séance bientôt disponible.
        </div>
      </div>
    </section>
  );
}

function V4Journey() {
  return (
    <section id="parcours" aria-labelledby="v4-journey-title" className="v4-journey">
      <div>
        <p className="v4-eyebrow">Un parcours concret</p>
        <h2 id="v4-journey-title">De vos notes à une décision relue.</h2>
      </div>
      <p>
        Après la séance, vous conservez vos observations, préparez un compte
        rendu clair et choisissez vous-même ce qui est prêt à être partagé.
      </p>
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
        <V4Journey />
        <V4Pricing />
        <V4Close />
      </main>
      <V4Footer />
    </div>
  );
}
