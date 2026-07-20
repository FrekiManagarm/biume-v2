import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

const anchorLinks = [
  { href: "#transformation", label: "La méthode" },
  { href: "#terrain", label: "Le terrain" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

export function V2Masthead() {
  return (
    <header className="relative z-20 border-b border-[color:var(--v2-line)]">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[color:var(--v2-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-[color:var(--v2-paper)]"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href="/v2"
          className="v2-display flex min-h-11 items-center text-[1.4rem] font-medium tracking-[-0.01em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent-deep)]"
        >
          Biume<span className="text-[color:var(--v2-accent)]">.</span>
        </Link>

        <p
          aria-hidden="true"
          className="v2-mono hidden text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--v2-ink-faint)] lg:block"
        >
          Revue du compte rendu — Édition Nº&nbsp;02
        </p>

        <nav aria-label="Navigation principale" className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {anchorLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="v2-link v2-mono inline-flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-soft)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="masthead-signup"
            className="v2-mono inline-flex min-h-11 items-center justify-center bg-[color:var(--v2-ink)] px-5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[color:var(--v2-paper)] transition-colors duration-200 hover:bg-[color:var(--v2-accent-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--v2-accent-deep)] active:scale-[0.98]"
          >
            Essayer gratuitement
          </Link>
        </nav>
      </div>
    </header>
  );
}
