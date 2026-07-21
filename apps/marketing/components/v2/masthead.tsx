"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { webAppPath } from "../../lib/web-app-url";

const anchorLinks = [
  { href: "#produit", label: "Produit" },
  { href: "#methode", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

export function V2Masthead() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 16);

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isScrolled
          ? "border-[color:var(--v2-line)] bg-[color:var(--v2-canvas)]/95 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
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
          />
          Biume<span className="text-[color:var(--v2-accent)]">.</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-8">
            {anchorLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`v2-link text-[0.88rem] ${
                    isScrolled
                      ? "text-[color:var(--v2-ink-soft)]"
                      : "text-[color:var(--v2-ink)]"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          data-conversion="masthead-signup"
          className="v2-btn v2-btn-primary v2-btn-sm"
        >
          Essayer gratuitement
        </Link>
      </div>
    </header>
  );
}
