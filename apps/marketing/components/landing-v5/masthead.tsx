"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { NAV_LINKS } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./motion";

const navLinkClassName =
  "min-h-11 inline-flex items-center text-[0.88rem] text-[color:var(--lv5-ink-soft)] transition-colors hover:text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]";

function closeOnLinkActivation(event: MouseEvent<HTMLDetailsElement>) {
  const target = event.target;
  if (target instanceof Element && target.closest("a")) {
    event.currentTarget.removeAttribute("open");
  }
}

export function LandingV5Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    node.dataset.scrolled = window.scrollY > 16 ? "true" : "false";

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
      data-masthead=""
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-[60] h-[72px] border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-[350ms] data-[scrolled=true]:border-[color:var(--lv5-line)] data-[scrolled=true]:bg-[color:var(--lv5-canvas)]/94 data-[scrolled=true]:backdrop-blur-[10px]"
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
          className="min-h-11 flex items-center gap-2 text-[1.28rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={30}
            height={30}
            className="size-[30px] rounded-[8px]"
          />
          Biume<span className="text-[color:var(--lv5-violet)]">.</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-[900px]:flex min-[900px]:items-center min-[900px]:gap-[clamp(14px,2.4vw,30px)]"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={navLinkClassName}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="masthead-signup"
            className="min-h-11 hidden min-[520px]:inline-flex items-center rounded-full bg-[color:var(--lv5-violet)] px-5 text-[0.88rem] font-semibold whitespace-nowrap text-white"
          >
            Essayer gratuitement
          </Link>

          <details
            className="relative min-[900px]:hidden"
            onClick={closeOnLinkActivation}
          >
            <summary
              aria-label="Ouvrir le menu"
              className="min-h-11 flex w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/90 marker:hidden [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span className="block h-[1.5px] w-[17px] rounded-full bg-[color:var(--lv5-ink)]" />
                <span className="block h-[1.5px] w-[17px] rounded-full bg-[color:var(--lv5-ink)]" />
              </span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+1px)] w-screen max-w-[calc(100vw-2*clamp(18px,4vw,34px))] border-t border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)]">
              <nav
                aria-label="Navigation mobile"
                className="flex flex-col px-[clamp(18px,4vw,34px)] py-2.5"
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="min-h-11 flex items-center border-b border-[color:var(--lv5-line)] text-[1.02rem] font-semibold text-[color:var(--lv5-ink)] last:border-b-0"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
