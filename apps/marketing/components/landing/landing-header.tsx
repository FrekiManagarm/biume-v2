import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { HeaderMotion } from "./header-motion";
import { MobileMenu } from "./mobile-menu";

const navigation = [
  { href: "#produit", label: "Produit" },
  { href: "#methode", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

const navigationLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-sm font-medium text-[color:var(--atelier-muted)] transition-colors hover:text-[color:var(--atelier-ink)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]";

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Biume accueil"
      className="flex min-h-11 shrink-0 items-center gap-2.5 text-sm font-semibold tracking-[-0.02em] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
    >
      <Image
        src="/brand/biume-logo.svg"
        alt=""
        width={32}
        height={32}
        className="size-8"
        priority
      />
      <span>Biume</span>
    </Link>
  );
}

function DemoLink() {
  return (
    <Link
      href="https://cal.com/mathieu-chambaud-biume"
      target="_blank"
      rel="noopener noreferrer"
      className="atelier-action inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] px-4 text-sm font-semibold text-[color:var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
    >
      Demander une démo
    </Link>
  );
}

function SignupLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={webAppPath("/signup")}
      prefetch={false}
      data-conversion="header-signup"
      className={`atelier-action inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--atelier-violet)] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)] ${
        compact ? "px-4 text-sm lg:hidden" : "px-5 text-sm"
      }`}
    >
      {compact ? "Essayer" : "Essayer gratuitement"}
    </Link>
  );
}

export function LandingHeader() {
  return (
    <HeaderMotion>
      <Brand />

      <nav
        aria-label="Navigation principale"
        className="mx-auto hidden items-center lg:flex"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navigationLinkClassName}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">
        <Link
          href={webAppPath("/signin")}
          prefetch={false}
          className={navigationLinkClassName}
        >
          Connexion
        </Link>
        <DemoLink />
        <SignupLink />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <SignupLink compact />
        <MobileMenu>
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] px-4 text-sm font-semibold marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--atelier-surface-radius)] border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] p-3 shadow-[0_4px_8px_rgba(29,29,33,0.14)]">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navigationLinkClassName}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={webAppPath("/signin")}
                prefetch={false}
                className={navigationLinkClassName}
              >
                Connexion
              </Link>
            </nav>
          </div>
        </MobileMenu>
      </div>
    </HeaderMotion>
  );
}
