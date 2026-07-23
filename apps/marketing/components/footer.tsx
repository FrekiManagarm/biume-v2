import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "/osteopathe-animalier", label: "Ostéopathe animalier" },
  { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
  { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
  { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
  { href: "/blog", label: "Blog ostéopathe animalier" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comparatifs", label: "Comparatifs" },
  { href: "/alternatives/animalib", label: "Alternative Animalib" },
  { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
  { href: "/alternatives/mytour", label: "Alternative MyTour" },
  { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
  { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
  { href: "https://cal.com/mathieu-chambaud-biume", label: "Démo" },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
] as const;

const footerLinkClassName =
  "v2-link inline-flex min-h-11 items-center text-[0.9rem] text-[color:var(--v2-ink-soft)] hover:text-[color:var(--v2-ink)]";

const LandingFooter = () => {
  return (
    <footer className="border-t border-[color:var(--v2-line)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.1fr_1.6fr_0.6fr]">
          <div>
            <Link
              href="/"
              className="v2-display flex min-h-11 items-center gap-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]"
            >
              <Image src="/brand/biume-logo.svg" alt="" width={32} height={32} className="size-8" />
              Biume<span className="text-[color:var(--v2-accent)]">.</span>
            </Link>
            <p className="mt-4 max-w-[30ch] text-[0.9rem] leading-[1.6] text-[color:var(--v2-ink-soft)]">
              Le compte rendu propriétaire et le suivi post-séance pour les ostéopathes animaliers.
            </p>
          </div>
          <nav aria-label="Pied de page — Produit">
            <p className="v2-eyebrow">Produit</p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={footerLinkClassName}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Pied de page — Légal">
            <p className="v2-eyebrow">Légal</p>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-14 border-t border-[color:var(--v2-line)] pt-7 text-[0.82rem] text-[color:var(--v2-ink-faint)]">
          © {new Date().getFullYear()} Biume. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
