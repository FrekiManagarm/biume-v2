"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { CHAPTERS, TRIAL_NOTE } from "./chapters";

/**
 * Le hero est un plan sombre plein écran : au repos la barre est
 * transparente et son encre est claire. Elle bascule sur fond de toile
 * dès qu'on a quitté le premier chapitre.
 */
export function Masthead() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => setSolid(window.scrollY > window.innerHeight * 0.82);
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

  // Encre claire tant qu'on est sur le plan sombre du hero.
  const onDark = !solid && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 border-b transition-[background-color,border-color] duration-[200ms] ${
          open
            ? "border-[color:var(--lv3-line)] bg-[color:var(--lv3-canvas)]"
            : solid
              ? "border-[color:var(--lv3-line)] bg-[color:var(--lv3-canvas)]/92 backdrop-blur-md"
              : "border-transparent bg-transparent"
        }`}
        style={{ zIndex: "var(--lv3-z-masthead)" }}
      >
        <a
          href="#contenu"
          className="sr-only rounded-full focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-[color:var(--lv3-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu
        </a>

        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-6 px-5 md:px-8">
          <Link
            href="/"
            className={`flex min-h-11 items-center gap-2 text-[1.2rem] font-bold tracking-[-0.03em] transition-colors duration-[200ms] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--lv3-violet)] ${
              onDark
                ? "text-[color:var(--lv3-on-dark)]"
                : "text-[color:var(--lv3-ink)]"
            }`}
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
            <ul className="flex items-center gap-6">
              {CHAPTERS.slice(0, 4).map((chapter) => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    className={`inline-flex min-h-11 items-center text-[0.875rem] font-medium transition-colors duration-[200ms] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--lv3-violet)] ${
                      onDark
                        ? "text-[color:var(--lv3-on-dark-2)] hover:text-white"
                        : "lv3-link"
                    }`}
                  >
                    {chapter.short}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Le conteneur porte l'affichage responsive : `.lv3-btn`
                déclare `display` et, chargé après les utilitaires
                Tailwind, il l'emporterait sur `hidden`. */}
            <span className="hidden sm:block">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="masthead-signup"
                className={`lv3-btn lv3-btn-sm ${
                  onDark ? "lv3-btn-on-dark" : "lv3-btn-primary"
                }`}
              >
                Essayer gratuitement
              </Link>
            </span>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="lv3-mobile-nav"
              className={`flex size-11 items-center justify-center rounded-full border transition-colors duration-[200ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv3-violet)] lg:hidden ${
                onDark
                  ? "border-[color:var(--lv3-line-dark)] text-white"
                  : "border-[color:var(--lv3-line)] text-[color:var(--lv3-ink)]"
              }`}
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
          id="lv3-mobile-nav"
          style={{ zIndex: "var(--lv3-z-overlay)" }}
          className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto border-t border-[color:var(--lv3-line)] bg-[color:var(--lv3-canvas)] px-5 pb-10 pt-2 lg:hidden"
        >
          <nav aria-label="Navigation mobile">
            <ol className="divide-y divide-[color:var(--lv3-line)]">
              {CHAPTERS.map((chapter, index) => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center gap-4 text-[1.05rem] font-medium text-[color:var(--lv3-ink)]"
                  >
                    <span className="lv3-fn text-[color:var(--lv3-ink-2)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {chapter.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center gap-4 text-[1.05rem] font-medium text-[color:var(--lv3-ink)]"
                >
                  <span className="lv3-fn text-[color:var(--lv3-ink-2)]">
                    06
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
            className="lv3-btn lv3-btn-primary mt-6 w-full"
          >
            Essayer gratuitement
          </Link>
          <p className="mt-3 text-center text-[0.82rem] text-[color:var(--lv3-ink-2)]">
            {TRIAL_NOTE}
          </p>
        </div>
      ) : null}
    </>
  );
}
