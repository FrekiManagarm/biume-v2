import Image from "next/image";
import Link from "next/link";

import { DEMO_URL } from "./constants";

/** Le maillage SEO existant est repris intégralement : aucune page
 *  interne ne perd son lien en changeant de direction visuelle. */
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
      {
        href: "/relance-client-osteopathe-animalier",
        label: "Relance client",
      },
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

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--lv2-line)]">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_0.7fr]">
          <div>
            <Link
              href="/"
              className="flex min-h-11 items-center gap-2 text-[1.2rem] font-bold tracking-[-0.03em] text-[color:var(--lv2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--lv2-violet)]"
            >
              <Image
                src="/brand/biume-logo.svg"
                alt=""
                width={30}
                height={30}
                className="size-[30px]"
              />
              Biume
            </Link>
            <p className="mt-4 max-w-[32ch] text-[0.9rem] leading-[1.6] text-[color:var(--lv2-ink-2)]">
              Le compte rendu propriétaire et le suivi post-séance pour les
              ostéopathes animaliers.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`Pied de page — ${column.title}`}>
              {/* Intitulé de colonne, pas un niveau de titre : chaque nav
                  porte déjà son `aria-label`, et le plan du document reste
                  celui des sections de la page. */}
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink)]">
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
                        className="lv2-link text-[0.9rem]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="lv2-link text-[0.9rem]">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-14 border-t border-[color:var(--lv2-line)] pt-7 text-[0.82rem] text-[color:var(--lv2-ink-2)]">
          © 2026 Biume. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
