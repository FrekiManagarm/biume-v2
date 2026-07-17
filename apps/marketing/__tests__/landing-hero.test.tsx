import { describe, expect, test } from "bun:test";

import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("soft machine header and hero", () => {
  test("header keeps factual navigation, both signup paths, and a desktop demo path", () => {
    const html = renderWithLandingImageConfig(<LandingHeader />);
    const signupAnchors = conversionAnchors(html, "header-signup");
    const desktopDemoIndex = html.indexOf(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    const desktopSignupIndex = html.indexOf('data-conversion="header-signup"');
    const interactiveClasses = Array.from(
      html.matchAll(/<(?:a|summary)\b[^>]*class="([^"]*)"/g),
      (match) => match[1],
    );

    for (const label of [
      "Le produit",
      "Comment ça marche",
      "Tarifs",
      "Ressources",
      "Connexion",
    ]) {
      expect(html).toContain(label);
    }

    expect(html).toContain("Navigation mobile");
    expect(html).toContain("Demander une démo");
    expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
    expect(desktopDemoIndex).toBeGreaterThanOrEqual(0);
    expect(desktopSignupIndex).toBeGreaterThan(desktopDemoIndex);
    expect(signupAnchors).toHaveLength(2);
    for (const anchor of signupAnchors) {
      expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
    }
    for (const className of interactiveClasses) {
      expect(className).toMatch(/\bmin-h-(?:1[1-9]|[2-9]\d)\b/);
    }
  });

  test("hero renders the demonstrative promise and conversion paths in server markup", () => {
    const html = renderWithLandingImageConfig(<LandingHero />);
    const text = textOnly(html);

    expect(text).toContain("Le propriétaire comprend. Vous décidez.");
    expect(text).not.toContain(
      "De vos notes au propriétaire, sans perdre votre regard métier.",
    );
    expect(html).toContain('data-hero-headline-accent="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(text).toContain(
      "Biume organise vos observations en un compte rendu clair, puis vous aide à garder le fil après la séance. Vous relisez et décidez de chaque partage.",
    );
    expect(text).toContain("15 jours d’essai");
    expect(text).toContain("Sans carte bancaire");
    expect(text).toContain("Rien ne part sans vous");
    expect(html).toContain("soft-machine-hero.png");
    expect(html).toContain(
      'alt="Un mécanisme abstrait transforme des notes en document structuré puis en suivi validé"',
    );
    expect(html).toContain('data-conversion="hero-signup"');
    expect(html).toContain('data-conversion="hero-demo"');
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
    expect(html).toContain("data-hero-mechanism");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("keeps the hero server-rendered with one transform-only reduced-motion motion island", async () => {
    const [heroSource, mechanismSource, headerSource, headerMotionSource] =
      await Promise.all([
      Bun.file(
        new URL("../components/landing/landing-hero.tsx", import.meta.url),
      ).text(),
      Bun.file(
        new URL("../components/landing/hero-mechanism.tsx", import.meta.url),
      ).text(),
      Bun.file(
        new URL("../components/landing/landing-header.tsx", import.meta.url),
      ).text(),
      Bun.file(
        new URL("../components/landing/header-motion.tsx", import.meta.url),
      ).text(),
    ]);

    expect(heroSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(heroSource).not.toMatch(/from\s+["']motion\/react["']/);
    expect(heroSource).not.toContain("adaptedProposal");
    expect(heroSource).toContain("var(--machine-blue-ink)");
    expect(heroSource).toContain("bg-linear-to-r");
    expect(heroSource).toContain("lg:max-w-[24ch]");
    expect(heroSource).not.toContain("bg-clip-text");
    expect(heroSource).not.toContain("text-transparent");
    expect(headerSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(headerSource).not.toMatch(/from\s+["']motion\/react["']/);
    expect(headerMotionSource).toContain("var(--machine-line)");
    expect(headerMotionSource).toContain("var(--machine-canvas)");
    expect(headerMotionSource).not.toContain("var(--carnet-");
    const desktopActionsSource = headerSource.match(
      /<div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">([\s\S]*?)<\/div>/,
    )?.[1];
    expect(desktopActionsSource).toBeDefined();
    const demoLinkIndex = desktopActionsSource?.indexOf("<DemoLink />") ?? -1;
    const signupLinkIndex =
      desktopActionsSource?.indexOf("<SignupLink />") ?? -1;
    expect(demoLinkIndex).toBeGreaterThanOrEqual(0);
    expect(signupLinkIndex).toBeGreaterThanOrEqual(0);
    expect(demoLinkIndex).toBeLessThan(signupLinkIndex);
    expect(mechanismSource).toMatch(/^"use client";/);
    expect(mechanismSource).toMatch(/from\s+["']motion\/react["']/);
    expect(mechanismSource).toContain("useReducedMotion");
    expect(mechanismSource).toContain("data-hero-mechanism");
    expect(mechanismSource).toContain(
      "initial={reduceMotion ? false : { scale: 1.015 }}",
    );
    expect(mechanismSource).toContain("animate={{ scale: 1 }}");
    expect(mechanismSource).toMatch(/duration:\s*reduceMotion \? 0 : 0\.72/);
    expect(mechanismSource).toMatch(/ease:\s*\[0\.16, 1, 0\.3, 1\]/);
    expect(mechanismSource).not.toMatch(/opacity\s*:\s*0/);
    expect(mechanismSource).not.toMatch(
      /\b(?:opacity|x|y|rotate|width|height)\s*:/,
    );
  });
});
