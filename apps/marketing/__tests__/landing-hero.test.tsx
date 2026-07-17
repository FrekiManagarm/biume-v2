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

describe("atelier header and hero", () => {
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
      "Produit",
      "Méthode",
      "Tarifs",
      "Ressources",
      "Connexion",
    ]) {
      expect(html).toContain(label);
    }

    expect(html).toContain("Navigation mobile");
    expect(html).toContain("Demander une démo");
    for (const href of ["#produit", "#methode", "#tarifs", "/blog"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain(`href="${webAppPath("/signin")}"`);
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

  test("renders the approved promise, new documentary image and product proof", () => {
    const html = renderWithLandingImageConfig(<LandingHero />);
    const text = textOnly(html);

    expect(text).toContain("Votre regard métier, jusqu’au propriétaire.");
    expect(text).toContain(
      "Biume transforme vos notes en un compte rendu clair, que vous relisez, adaptez et partagez uniquement quand vous le décidez.",
    );
    expect(text).toContain("15 jours gratuits");
    expect(text).toContain("Sans carte bancaire");
    expect(html).toContain("atelier-hero.webp");
    expect(html).toContain('data-hero-product-preview="true"');
    expect(text).toContain("Notes professionnelles");
    expect(text).toContain("Version propriétaire");
    expect(text).toContain("À relire");
    expect(html).toContain('data-conversion="hero-signup"');
    expect(html).toContain('href="#produit"');
    expect(text).toContain("Voir le parcours");
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("keeps the hero and header server-rendered with atelier tokens", async () => {
    const [heroSource, headerSource, headerMotionSource] = await Promise.all([
      Bun.file(
        new URL("../components/landing/landing-hero.tsx", import.meta.url),
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
    expect(heroSource).toContain("REPORT_TRANSFORMATION_DEMO");
    expect(heroSource).toContain("var(--atelier-violet)");
    expect(heroSource).not.toContain("var(--machine-");
    expect(heroSource).not.toContain("bg-clip-text");
    expect(heroSource).not.toContain("text-transparent");
    expect(headerSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(headerSource).not.toMatch(/from\s+["']motion\/react["']/);
    expect(headerSource).not.toContain("var(--machine-");
    expect(headerSource).toContain("atelier-action");
    expect(headerMotionSource).toContain("var(--atelier-line)");
    expect(headerMotionSource).toContain("var(--atelier-canvas)");
    expect(headerMotionSource).not.toContain("var(--machine-");
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
  });
});
