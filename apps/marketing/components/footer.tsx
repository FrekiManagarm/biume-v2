import { PawPrint } from "lucide-react";
import Link from "next/link";

const productLinks = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  {
    href: "https://cal.com/mathieu-chambaud-biume",
    label: "Réserver une démo",
  },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/privacy", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
  { href: "/contact", label: "Contact" },
];

const LandingFooter = () => {
  return (
    <footer className="border-t border-border/30 bg-muted/3 py-16 md:py-20">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-14">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                <PawPrint className="w-4 h-4 fill-white text-white" />
              </div>
              <span className="font-bold text-lg">Biume</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              La solution complète pour les thérapeutes animaliers. Gagnez du
              temps sur vos rapports et concentrez-vous sur le soin.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            <h4 className="font-semibold text-sm mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Biume. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            Hébergé en France (RGPD)
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
