"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./reveal";

const anchorLinks = [
  { href: "#produit", label: "Produit" },
  { href: "#methode", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

export function V2Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    // ScrollTrigger n'appelle pas forcément `onRefresh` après la
    // restauration de scroll du navigateur. Une lecture ponctuelle au
    // montage évite un masthead transparent posé sur du contenu.
    node.dataset.scrolled = window.scrollY > 16 ? "true" : "false";

    // Un seul observateur du défilement sur la page. Le masthead
    // n'ouvre plus le sien : il lit celui de ScrollTrigger.
    const trigger = ScrollTrigger.create({
      start: 16,
      onUpdate: (self) => {
        node.dataset.scrolled = self.scroll() > 16 ? "true" : "false";
      },
      onRefresh: (self) => {
        node.dataset.scrolled = self.scroll() > 16 ? "true" : "false";
      },
    });

    return () => trigger.kill();
  });

  return (
    <header
      ref={host}
      data-scrolled="false"
      className="group fixed inset-x-0 top-0 z-40 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-[color:var(--v2-line)] data-[scrolled=true]:bg-[color:var(--v2-canvas)]/95 data-[scrolled=true]:backdrop-blur-md"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[color:var(--v2-espresso)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 transition-[height] duration-300 group-data-[scrolled=true]:h-14 md:px-8">
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
                  className="v2-link text-[0.88rem] text-[color:var(--v2-ink)] group-data-[scrolled=true]:text-[color:var(--v2-ink-soft)]"
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
