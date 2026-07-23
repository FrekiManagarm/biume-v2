import Link from "next/link";
import Image from "next/image";
import { Accordion, Card } from "@heroui/react";

import { webAppPath } from "../../lib/web-app-url";

import { V4SessionConsole } from "./v4-session-console";

const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

const pricingInclusions = [
  "Essai gratuit de 15 jours sans carte bancaire",
  "Compte rendu propriétaire structuré",
  "Reformulation et validation passage par passage",
  "Export PDF professionnel",
  "Suivi et rappel après séance",
] as const;

const journeyChapters = [
  {
    id: "terrain",
    marker: "Carnet",
    title: "La séance garde sa texture.",
    body: "Vous partez de vos mots, de vos zones observées, de ce qui mérite d'être transmis et de ce qui doit rester dans votre lecture métier.",
    image: "/assets/images/landing/atelier-practice.webp",
    alt: "Carnet et mains d'une praticienne pendant une séance d'ostéopathie animale",
  },
  {
    id: "atelier",
    marker: "Atelier",
    title: "Biume met de l'ordre sans prendre la main.",
    body: "La note devient un compte rendu lisible, découpé en passages courts. Chaque proposition reste modifiable avant toute exportation.",
    image: "/assets/images/landing/soft-machine-hero.png",
    alt: "Interface Biume illustrant la transformation d'une note de séance",
  },
  {
    id: "proprietaire",
    marker: "Lien",
    title: "Le propriétaire reçoit une suite claire.",
    body: "Le PDF et le message de suivi gardent le ton professionnel, les conseils utiles et le rappel que vous choisissez d'envoyer.",
    image: "/assets/images/landing/atelier-owner.webp",
    alt: "Propriétaire consultant un compte rendu après une séance animale",
  },
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
          <a className="v4-focus-ring" href="#controle">
            Contrôle
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
          <p className="v4-kicker">Landing v4 · atelier HeroUI</p>
          <h1 id="v4-hero-title">De vos notes au propriétaire, sans perdre votre regard métier.</h1>
          <p className="v4-hero-line">Préparez. Relisez. Décidez.</p>
          <p className="v4-hero-description">
            Biume accompagne les ostéopathes animaliers dans le passage délicat
            entre l'observation de séance et le compte rendu compréhensible.
            Le produit prépare la matière, vous gardez la dernière décision.
          </p>
          <div className="v4-hero-actions">
            <a
              className="v4-action v4-focus-ring"
              data-conversion="v4-hero-signup"
              href={webAppPath("/signup")}
            >
              Essayer gratuitement
            </a>
            <a className="v4-secondary-action v4-focus-ring" href="#parcours">
              Voir le parcours
            </a>
          </div>
          <p className="v4-trial-note">15 jours gratuits, sans carte bancaire.</p>
        </div>
        <div className="v4-hero-stage" aria-label="Carnet de séance Biume">
          <Card.Root className="v4-hero-image" variant="secondary">
            <Card.Content className="v4-hero-image-content">
            <Image
              src="/assets/images/landing/hero-practitioner-horse.png"
              alt="Une ostéopathe animalière accompagne un cheval pendant une séance"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
            </Card.Content>
          </Card.Root>
          <V4SessionConsole />
        </div>
      </div>
    </section>
  );
}

function V4Journey() {
  return (
    <section
      id="parcours"
      aria-labelledby="v4-proof-title"
      className="v4-journey"
    >
      <div className="v4-section-intro">
        <p className="v4-kicker">Un récit de séance</p>
        <h2 id="v4-proof-title">Votre note reste la source. Le reste devient partageable.</h2>
        <p>
          La page suit le même trajet que votre fin de séance: une trace précise,
          une reformulation contrôlée, puis une continuité claire pour le propriétaire.
        </p>
      </div>
      <div className="v4-journey-grid">
        {journeyChapters.map((chapter) => (
          <Card.Root
            className={`v4-chapter v4-chapter-${chapter.id}`}
            key={chapter.id}
            variant="default"
          >
            <Card.Content className="v4-chapter-media">
              <Image
                src={chapter.image}
                alt={chapter.alt}
                fill
                priority={chapter.id === "terrain"}
                sizes="(min-width: 1024px) 34vw, 100vw"
              />
            </Card.Content>
            <Card.Footer className="v4-chapter-copy">
              <p>{chapter.marker}</p>
              <Card.Title>{chapter.title}</Card.Title>
              <Card.Description className="v4-chapter-description">
                {chapter.body}
              </Card.Description>
            </Card.Footer>
          </Card.Root>
        ))}
      </div>
    </section>
  );
}

function V4Control() {
  return (
    <section
      id="controle"
      aria-labelledby="v4-control-title"
      className="v4-control"
    >
      <div className="v4-control-copy">
        <p className="v4-kicker">Le violet décide, le vert confirme</p>
        <h2 id="v4-control-title">Biume propose. Vous validez chaque passage.</h2>
        <p>
          La nouvelle fiche de style reprend les rôles HeroUI: l'accent violet
          guide l'action, le vert ne signale que les états terminés. Le résultat
          reste lisible, sobre et directement relié au produit.
        </p>
      </div>
      <div className="v4-control-panel" aria-label="Étapes de validation">
        <Card.Root className="v4-note-card v4-note-card-raw" variant="tertiary">
          <Card.Header>
            <Card.Title className="v4-note-card-label">Note métier</Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Description>
              Restriction thoracique gauche. Mobilité améliorée après travail.
            </Card.Description>
          </Card.Content>
        </Card.Root>
        <Card.Root className="v4-note-card v4-note-card-review" variant="secondary">
          <Card.Header>
            <Card.Title className="v4-note-card-label">Version à relire</Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Description>
              La mobilité du thorax a été travaillée pendant la séance.
            </Card.Description>
          </Card.Content>
        </Card.Root>
        <Card.Root className="v4-note-card v4-note-card-done" variant="default">
          <Card.Header>
            <Card.Title className="v4-note-card-label">Validé par vous</Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Description>
              PDF prêt, message de suivi préparé, envoi sous votre contrôle.
            </Card.Description>
          </Card.Content>
        </Card.Root>
      </div>
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
        <p className="v4-kicker">Tarifs simples</p>
        <h2 id="v4-pricing-title">Un abonnement pour installer le réflexe après séance.</h2>
        <p>
          L'objectif n'est pas de rajouter un outil à votre journée, mais de
          raccourcir le moment où vos notes deviennent un document utile.
        </p>
      </div>
      <Card.Root
        className="v4-pricing-card"
        variant="secondary"
      >
        <Card.Header>
          <Card.Title className="v4-price">24,99 € / mois</Card.Title>
          <Card.Description className="v4-price-note">
            Facturé annuellement après l'essai gratuit.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <ul>
            {pricingInclusions.map((inclusion) => (
              <li key={inclusion}>{inclusion}</li>
            ))}
          </ul>
        </Card.Content>
        <Card.Footer>
          <a
            className="v4-action v4-focus-ring"
            data-conversion="v4-pricing-signup"
            href={webAppPath("/signup")}
          >
            Démarrer l'essai gratuit
          </a>
        </Card.Footer>
      </Card.Root>
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
        <p className="v4-kicker" id="v4-faq-kicker">
          Questions fréquentes
        </p>
        <h2 id="v4-faq-title">Ce qui reste entre vos mains.</h2>
      </div>
      <Card.Root className="v4-faq-list" variant="secondary">
        <Card.Content className="v4-faq-content">
          <Accordion>
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
        </Card.Content>
      </Card.Root>
    </section>
  );
}

function V4Close() {
  return (
    <Card.Root
      aria-labelledby="v4-close-title"
      className="v4-close"
      variant="secondary"
    >
      <Card.Header>
        <p className="v4-kicker">Pour la prochaine séance</p>
        <Card.Title id="v4-close-title">
          Gardez le dernier mot, même quand Biume prépare le terrain.
        </Card.Title>
      </Card.Header>
      <Card.Footer className="v4-close-actions">
        <a className="v4-action v4-focus-ring" href={webAppPath("/signup")}>
          Essayer gratuitement
        </a>
        <a
          className="v4-secondary-action v4-focus-ring"
          href={DEMO_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Demander une démo
        </a>
      </Card.Footer>
    </Card.Root>
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
    <div className="v4 light" data-theme="biume-heroui">
      <V4Header />
      <main id="contenu" tabIndex={-1}>
        <V4Hero />
        <V4Journey />
        <V4Control />
        <V4Pricing />
        <V4Faq />
        <V4Close />
      </main>
      <V4Footer />
    </div>
  );
}
