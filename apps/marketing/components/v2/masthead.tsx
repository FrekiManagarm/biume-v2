import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

const anchorLinks = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

export function V2Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--v2-line)] bg-[color:var(--v2-canvas)]/80 backdrop-blur-md">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[color:var(--v2-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5 md:px-8">
        <Link
          href="/v2"
          className="v2-display flex min-h-11 items-center text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]"
        >
          Biume<span className="text-[color:var(--v2-accent)]">.</span>
        </Link>

        <nav aria-label="Navigation principale" className="flex items-center gap-6">
          <ul className="hidden items-center gap-7 md:flex">
            {anchorLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="v2-link inline-flex min-h-11 items-center text-[0.83rem] font-medium text-[color:var(--v2-ink-soft)]"
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
            className="v2-btn v2-btn-primary !min-h-10 !rounded-lg !px-4 !text-[0.8rem]"
          >
            Essai gratuit
          </Link>
        </nav>
      </div>
    </header>
  );
}
