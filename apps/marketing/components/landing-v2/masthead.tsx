"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { webAppPath } from "../../lib/web-app-url";

const NAV = [
  { href: "#atelier", label: "Le compte rendu" },
  { href: "#controle", label: "Votre contrôle" },
  { href: "#suivi", label: "Le suivi" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

export function Masthead() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 12);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  // Fermeture au Escape + verrou du scroll pendant que le panneau est ouvert.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 border-b transition-[background-color,border-color] duration-200 ${
          open
            ? "border-[color:var(--lv2-line)] bg-[color:var(--lv2-canvas)]"
            : scrolled
              ? "border-[color:var(--lv2-line)] bg-[color:var(--lv2-canvas)]/92 backdrop-blur-md"
              : "border-transparent bg-transparent"
        }`}
        style={{ zIndex: "var(--lv2-z-masthead)" }}
      >
      <a
        href="#contenu"
        className="sr-only rounded-full focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-[color:var(--lv2-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>

      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 md:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-[1.2rem] font-bold tracking-[-0.03em] text-[color:var(--lv2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--lv2-violet)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={30}
            height={30}
            className="size-[30px]"
          />
          Biume
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                {/* Cible de 44px de haut : le texte fait 18px, insuffisant
                    seul pour un lien de navigation autonome. */}
                <a
                  href={item.href}
                  className="lv2-link inline-flex min-h-11 items-center text-[0.9rem]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Le conteneur porte l'affichage responsive : `.lv2-btn` déclare
              `display: inline-flex` et, chargé après les utilitaires
              Tailwind, il l'emporterait sur `hidden`. */}
          <span className="hidden sm:block">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="masthead-signup"
              className="lv2-btn lv2-btn-primary lv2-btn-sm"
            >
              Essayer gratuitement
            </Link>
          </span>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="lv2-mobile-nav"
            className="flex size-11 items-center justify-center rounded-full border border-[color:var(--lv2-line)] text-[color:var(--lv2-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv2-violet)] lg:hidden"
          >
            <span className="sr-only">
              {open ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <path d="M5 5 15 15" />
                  <path d="M15 5 5 15" />
                </>
              ) : (
                <>
                  <path d="M3 6.5h14" />
                  <path d="M3 13.5h14" />
                </>
              )}
            </svg>
          </button>
        </div>
        </div>
      </header>

      {/* Le panneau est un frère du header, jamais un enfant : `backdrop-filter`
          fait du header un bloc conteneur pour ses descendants `fixed`, et le
          panneau s'y retrouvait rogné à la hauteur de la barre. Cibles ≥ 44px. */}
      {open ? (
        <div
          ref={panelRef}
          id="lv2-mobile-nav"
          style={{ zIndex: "var(--lv2-z-overlay)" }}
          className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto border-t border-[color:var(--lv2-line)] bg-[color:var(--lv2-canvas)] px-5 pb-10 pt-2 lg:hidden"
        >
          <nav aria-label="Navigation mobile">
            <ul className="divide-y divide-[color:var(--lv2-line)]">
              {[...NAV, { href: "/blog", label: "Ressources" }].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center text-[1.05rem] font-medium text-[color:var(--lv2-ink)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="mobile-nav-signup"
            onClick={() => setOpen(false)}
            className="lv2-btn lv2-btn-primary mt-6 w-full"
          >
            Essayer gratuitement
          </Link>
          <p className="mt-3 text-center text-[0.82rem] text-[color:var(--lv2-ink-2)]">
            15 jours gratuits, sans carte bancaire
          </p>
        </div>
      ) : null}
    </>
  );
}
