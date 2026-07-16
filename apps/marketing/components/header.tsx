import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../lib/web-app-url";
import { KineticHeader } from "./landing/kinetic-header";

const navLinks = [
  { href: "/logiciel-osteopathe-animalier", label: "Produit" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
  { href: "/blog", label: "Blog" },
  { href: "/tarifs", label: "Tarifs" },
] as const;

function BiumeMark() {
  return (
    <Image
      src="/brand/biume-logo.svg"
      alt=""
      width={32}
      height={32}
      className="size-8"
      priority
    />
  );
}

const navigationLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Header() {
  return (
    <KineticHeader>
      <Link
        href="/"
        className="flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Biume accueil"
      >
        <BiumeMark />
        <span>Biume</span>
      </Link>

      <nav className="hidden items-center md:flex" aria-label="Navigation principale">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className={navigationLinkClassName}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden shrink-0 items-center gap-1 md:flex">
        <Link
          href={webAppPath("/signin")}
          prefetch={false}
          className={navigationLinkClassName}
        >
          Connexion
        </Link>
        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          title="Essai gratuit"
          className="landing-button inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Essayer gratuitement
        </Link>
      </div>

      <details className="group relative md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Menu
        </summary>
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-3 shadow-lg">
          <nav className="flex flex-col" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navigationLinkClassName}>
                {link.label}
              </Link>
            ))}
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby="header-demo-new-tab"
              data-conversion="header-demo"
              className={navigationLinkClassName}
            >
              Réserver une démo
              <span id="header-demo-new-tab" className="sr-only">
                Ouvre dans un nouvel onglet.
              </span>
            </Link>
            <Link
              href={webAppPath("/signin")}
              prefetch={false}
              className={navigationLinkClassName}
            >
              Connexion
            </Link>
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              title="Essai gratuit"
              className="landing-button mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </details>
    </KineticHeader>
  );
}
