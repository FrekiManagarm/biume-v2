import Image from "next/image";
import Link from "next/link";

const productLinks = [
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
  { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
  { href: "/blog", label: "Blog ostéopathe animalier" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comparatifs", label: "Comparatifs" },
  { href: "/alternatives/animalib", label: "Alternative Animalib" },
  { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
  { href: "/alternatives/mytour", label: "Alternative MyTour" },
  { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
  { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
  {
    href: "https://cal.com/mathieu-chambaud-biume",
    label: "Démo",
  },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
] as const;

const LandingFooter = () => {
  return (
    <footer className="border-t border-[color:var(--machine-line,var(--border))] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_auto]">
          <div>
            <Link
              href="/"
              className="flex min-h-11 items-center gap-2 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet,var(--primary))]"
            >
              <Image
                src="/brand/biume-logo.svg"
                alt=""
                width={32}
                height={32}
                className="size-8"
              />
              Biume
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[color:var(--machine-muted,var(--muted-foreground))]">
              Le compte rendu propriétaire et le suivi post-séance pour les
              ostéopathes animaliers.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Produit</h2>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-sm text-[color:var(--machine-muted,var(--muted-foreground))] transition-colors hover:text-[color:var(--machine-ink,var(--foreground))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet,var(--primary))]"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Légal</h2>
            <ul className="mt-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-sm text-[color:var(--machine-muted,var(--muted-foreground))] transition-colors hover:text-[color:var(--machine-ink,var(--foreground))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet,var(--primary))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--machine-line,var(--border))] pt-6 text-xs text-[color:var(--machine-muted,var(--muted-foreground))]">
          <p>© {new Date().getFullYear()} Biume. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
