import Link from "next/link";

import { DEMO_URL } from "./content";
import { Wordmark } from "./wordmark";

/** Le maillage interne existant est repris à l'identique : changer de
 *  direction visuelle ne doit coûter aucun lien aux pages SEO. */
const COLUMNS = [
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
      {
        href: "/exemple-compte-rendu-osteopathie-animale",
        label: "Exemple de compte rendu",
      },
      { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/blog", label: "Blog ostéopathe animalier" },
      { href: "/about", label: "À propos" },
      { href: DEMO_URL, label: "Démonstration" },
    ],
  },
  {
    title: "Comparatifs",
    links: [
      { href: "/comparatifs", label: "Tous les comparatifs" },
      { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
      { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
      { href: "/alternatives/animalib", label: "Alternative Animalib" },
      { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
      { href: "/alternatives/mytour", label: "Alternative MyTour" },
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

/**
 * Pied de page dans la continuité du plan sombre de clôture, séparé
 * par un simple filet. La page se termine dans l'encre plutôt que de
 * remonter au papier pour une dernière rangée de liens.
 */
export function Footer() {
  return (
    <footer className="border-t border-[color:var(--lv4-line)] bg-black/30 text-[color:var(--lv4-text)]">
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-16">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.7fr]">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--lv4-violet)]"
            >
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-[32ch] text-[0.9rem] leading-[1.6] text-[color:var(--lv4-text-3)]">
              Le compte rendu propriétaire et le suivi après séance, pour les
              ostéopathes animaliers.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav
              key={column.title}
              aria-label={`Pied de page — ${column.title}`}
            >
              {/* Intitulé de colonne, pas un niveau de titre : chaque nav
                  porte déjà son `aria-label`. */}
              <p className="lv4-note text-[color:var(--lv4-text)]">
                {column.title}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lv4-link text-[0.9rem]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="lv4-link text-[0.9rem]"
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

        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-4 border-t border-[color:var(--lv4-line)] pt-7">
          <p className="lv4-note text-[color:var(--lv4-text-3)]">
            © 2026 Biume
          </p>
          <p className="lv4-note text-[color:var(--lv4-text-3)]">
            Données hébergées en Europe
          </p>
        </div>
      </div>
    </footer>
  );
}
