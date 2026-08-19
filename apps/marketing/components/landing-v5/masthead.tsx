"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { HERO_CTA_PRIMARY, NAV_LINKS } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./motion";

function closeOnLinkActivation(event: MouseEvent<HTMLDetailsElement>) {
  if (event.target instanceof Element && event.target.closest("a")) {
    event.currentTarget.removeAttribute("open");
  }
}

export function LandingV5Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    node.dataset.scrolled = window.scrollY > 24 ? "true" : "false";

    const trigger = ScrollTrigger.create({
      start: 24,
      onUpdate: (self) => {
        node.dataset.scrolled = self.scroll() > 24 ? "true" : "false";
      },
      onRefresh: (self) => {
        node.dataset.scrolled = self.scroll() > 24 ? "true" : "false";
      },
    });

    return () => trigger.kill();
  });

  return (
    <header
      ref={host}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-[60] h-[68px] border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-[350ms] data-[scrolled=true]:border-[color:var(--lv5-line)] data-[scrolled=true]:bg-[rgba(247,247,244,.82)] data-[scrolled=true]:backdrop-blur-[12px]"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:min-h-11 focus:rounded-full focus:bg-[color:var(--lv5-violet)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-5 px-[clamp(18px,4vw,34px)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-lg"
          />
          Biume
        </Link>

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1 rounded-full border border-[color:var(--lv5-line)] bg-[rgba(253,253,251,.7)] p-1 max-[980px]:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-[34px] items-center rounded-full px-4 text-[0.88rem] text-[color:var(--lv5-ink-soft)] transition-colors hover:bg-[#F0EFEA] hover:text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={webAppPath("/signup")}
            data-conversion="header-signup"
            className="inline-flex h-10 items-center rounded-full bg-[color:var(--lv5-violet)] px-5 text-[0.86rem] font-semibold text-white shadow-[var(--lv5-shadow-cta)] transition-opacity hover:opacity-92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)] max-[520px]:hidden"
          >
            {HERO_CTA_PRIMARY}
          </a>

          <details
            className="relative min-[980px]:hidden"
            onClick={closeOnLinkActivation}
          >
            <summary
              className="flex size-11 items-center justify-center rounded-full border border-[color:var(--lv5-line)] text-[color:var(--lv5-ink)] [&::-webkit-details-marker]:hidden"
              aria-label="Ouvrir le menu"
            >
              <span aria-hidden="true">☰</span>
            </summary>
            <nav
              aria-label="Navigation mobile"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(88vw,320px)] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-2 shadow-[var(--lv5-shadow-hover)]"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex min-h-12 items-center rounded-full px-4 text-[0.9rem] text-[color:var(--lv5-ink-soft)] transition-colors hover:bg-[#F0EFEA] hover:text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={webAppPath("/signup")}
                data-conversion="header-signup-mobile"
                className="flex min-h-12 items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-4 text-[0.9rem] font-semibold text-white"
              >
                {HERO_CTA_PRIMARY}
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
