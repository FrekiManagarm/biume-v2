"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { SECTIONS, TRIAL_NOTE } from "./content";
import { Magnetic } from "./motion";
import { Wordmark } from "./wordmark";

/**
 * Barre fine, transparente au repos pour que le hero s'ouvre sans
 * couvercle, puis fondue au verre dès qu'on quitte le haut de page.
 */
export function Masthead() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

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
        className={`fixed inset-x-0 top-0 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? "border-[color:var(--lv4-line)] bg-[color:var(--lv4-void)]/72 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
        style={{ zIndex: "var(--lv4-z-masthead)" }}
      >
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-[color:var(--lv4-violet-core)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu
        </a>

        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-[var(--lv4-gutter)]">
          <Link
            href="/"
            className="flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--lv4-violet)]"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="lv4-note inline-flex min-h-11 items-center text-[color:var(--lv4-text-3)] transition-colors duration-200 hover:text-[color:var(--lv4-text)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--lv4-violet)]"
                  >
                    {section.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Le conteneur porte l'affichage responsive : `.lv4-btn`
                déclare `display` et, chargé après les utilitaires
                Tailwind, l'emporterait sur `hidden`. */}
            <span className="hidden sm:block">
              <Magnetic strength={0.22}>
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  data-conversion="masthead-signup"
                  className="lv4-btn lv4-btn-primary lv4-btn-sm"
                >
                  Essayer gratuitement
                </Link>
              </Magnetic>
            </span>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="lv4-mobile-nav"
              className="flex size-11 cursor-pointer items-center justify-center rounded-[3px] border border-[color:var(--lv4-line-2)] bg-white/[0.03] text-[color:var(--lv4-text)] transition-colors duration-200 hover:border-[color:var(--lv4-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv4-violet)] lg:hidden"
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

      {/* Frère du header, jamais enfant : `backdrop-filter` ferait du
          header un bloc conteneur et rognerait ce panneau `fixed`. */}
      {open ? (
        <div
          ref={panelRef}
          id="lv4-mobile-nav"
          style={{ zIndex: "var(--lv4-z-overlay)" }}
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-[color:var(--lv4-line)] bg-[color:var(--lv4-void)]/95 px-[var(--lv4-gutter)] pb-10 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Navigation mobile">
            <ol>
              {SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setOpen(false)}
                    className="flex min-h-16 items-center gap-5 border-b border-[color:var(--lv4-line)] text-[1.15rem] font-medium tracking-[-0.02em] text-[color:var(--lv4-text)]"
                  >
                    <span className="lv4-note text-[color:var(--lv4-violet)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.nav}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="flex min-h-16 items-center gap-5 border-b border-[color:var(--lv4-line)] text-[1.15rem] font-medium tracking-[-0.02em] text-[color:var(--lv4-text)]"
                >
                  <span className="lv4-note text-[color:var(--lv4-violet)]">
                    07
                  </span>
                  Ressources
                </Link>
              </li>
            </ol>
          </nav>

          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="mobile-nav-signup"
            onClick={() => setOpen(false)}
            className="lv4-btn lv4-btn-primary mt-8 w-full"
          >
            Essayer gratuitement
          </Link>
          <p className="lv4-note mt-3 text-center text-[color:var(--lv4-text-3)]">
            {TRIAL_NOTE}
          </p>
        </div>
      ) : null}
    </>
  );
}
