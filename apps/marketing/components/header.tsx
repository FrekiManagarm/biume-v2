import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../lib/web-app-url";

const navLinks = [
  { href: "/logiciel-osteopathe-animalier", label: "Produit" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
  { href: "/blog", label: "Blog" },
  { href: "/tarifs", label: "Tarifs" },
] as const;

const navLinkClassName =
  "v2-link inline-flex min-h-11 items-center px-2 text-[0.88rem] text-[color:var(--v2-ink-soft)] hover:text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]";

export function Header() {
  return (
    <header className="sticky inset-x-0 top-0 z-40 border-b border-[color:var(--v2-line)] bg-[color:var(--v2-canvas)]/95 backdrop-blur-md">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[color:var(--v2-espresso)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="v2-display flex min-h-11 items-center gap-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={32}
            height={32}
            className="size-8"
            priority
          />
          Biume<span className="text-[color:var(--v2-accent)]">.</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={navLinkClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={webAppPath("/signin")}
            prefetch={false}
            className={navLinkClassName}
          >
            Connexion
          </Link>
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            className="v2-btn v2-btn-primary v2-btn-sm"
          >
            Essayer gratuitement
          </Link>
        </div>

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[color:var(--v2-line-strong)] px-4 text-sm font-medium text-[color:var(--v2-ink)] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] border border-[color:var(--v2-line)] bg-[color:var(--v2-surface)] p-3 shadow-[0_4px_8px_rgba(29,29,33,0.14)]">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClassName}>
                  {link.label}
                </Link>
              ))}
              <Link
                href={webAppPath("/signin")}
                prefetch={false}
                className={navLinkClassName}
              >
                Connexion
              </Link>
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                className="v2-btn v2-btn-primary v2-btn-sm mt-2"
              >
                Essayer gratuitement
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
