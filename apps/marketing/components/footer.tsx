import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { href: "/#console", label: "Produit" },
  { href: "/#workflow", label: "Methode" },
  { href: "/#pricing", label: "Tarifs" },
  {
    href: "https://cal.com/mathieu-chambaud-biume",
    label: "Demo",
  },
];

const legalLinks = [
  { href: "/privacy", label: "Confidentialite" },
  { href: "/cgu", label: "CGU" },
  { href: "/contact", label: "Contact" },
];

const LandingFooter = () => {
  return (
    <footer className="px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl border-t border-border pt-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Image
                src="/brand/biume-logo.svg"
                alt=""
                width={32}
                height={32}
                className="size-8"
              />
              Biume
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              La plateforme de rapports et de suivi client pour les therapeutes
              animaliers.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <h4 className="text-sm font-semibold">Produit</h4>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Biume. Tous droits reserves.</p>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-secondary/70" />
            <span>Heberge en France, conforme RGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
