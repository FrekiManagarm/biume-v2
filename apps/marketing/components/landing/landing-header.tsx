import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { HeaderMotion } from "./header-motion";

const navigation = [
  { href: "#produit", label: "Le produit" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

const navigationLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-sm font-medium text-[color:var(--carnet-muted)] transition-colors hover:text-[color:var(--carnet-ink)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]";

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Biume accueil"
      className="flex min-h-11 shrink-0 items-center gap-2.5 text-sm font-semibold tracking-[-0.02em] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
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

function SignupLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={webAppPath("/signup")}
      prefetch={false}
      data-conversion="header-signup"
      className={`carnet-action inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)] ${
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
        <SignupLink />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <SignupLink compact />
        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-4 text-sm font-semibold marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-3 shadow-[0_28px_70px_-46px_rgba(29,29,33,0.38)]">
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
        </details>
      </div>
    </HeaderMotion>
  );
}
