import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeaderMotion } from "../components/landing/header-motion";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("Carnet vivant header and hero", () => {
  test("header motion is visible in server markup", () => {
    const html = renderToStaticMarkup(
      <HeaderMotion>
        <a href="/signup">Essayer</a>
      </HeaderMotion>,
    );

    expect(html).toContain("data-header-motion");
    expect(html).toContain("data-header-surface");
    expect(html).toContain("Essayer");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("homepage header keeps signup visible and navigation factual", () => {
    const html = renderWithLandingImageConfig(<LandingHeader />);
    const signupAnchors = conversionAnchors(html, "header-signup");

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
    expect(html).toContain(">Essayer</a>");
    expect(signupAnchors).toHaveLength(2);
    for (const anchor of signupAnchors) {
      expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
    }
  });

  test("hero renders approved copy and one integrated product surface", () => {
    const html = renderWithLandingImageConfig(
      <LandingHero
        adaptedProposal={REPORT_TRANSFORMATION_DEMO.adaptedProposal}
      />,
    );
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "hero-signup");

    expect(html).toContain(
      "Le compte rendu propriétaire des ostéopathes animaliers",
    );
    expect(text).toContain("Vos observations, dans des mots qui restent.");
    expect(html).toContain(
      "Biume structure vos notes et prépare un compte rendu clair pour le propriétaire. Vous relisez, corrigez et choisissez quand le partager.",
    );
    expect(html).toContain("Voir un exemple de compte rendu");
    expect(html).toContain("15 jours d&#x27;essai");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Partagé par vous");
    expect(html).toContain("Proposition adaptée");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("Vous pouvez encore modifier ce texte");
    expect(html).toContain("Partager le PDF");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).toContain("q=55");
    expect(html).toContain('loading="lazy"');
    expect(html.toLowerCase()).not.toContain('fetchpriority="high"');
    expect(html).not.toContain('rel="preload" as="image"');
    expect(html).toMatch(/data-hero-photo[^>]*class="[^"]*hidden[^"]*md:block/);
    expect(html).toMatch(/data-hero-product[^>]*class="[^"]*mt-0[^"]*md:-mt-20/);
    expect(html.match(/data-hero-product=/g)).toHaveLength(1);
    expect(text).not.toContain(REPORT_TRANSFORMATION_DEMO.observation);
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("hero animation is transform-only and the hero stays server-side", async () => {
    const heroSource = await Bun.file(
      new URL("../components/landing/landing-hero.tsx", import.meta.url),
    ).text();
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();
    const entryKeyframes = css.match(
      /@keyframes landing-hero-enter\s*{([\s\S]*?)\n}/,
    )?.[1];
    const photoKeyframes = css.match(
      /@keyframes landing-hero-photo-enter\s*{([\s\S]*?)\n}/,
    )?.[1];

    expect(heroSource).not.toContain('"use client"');
    expect(heroSource).not.toContain('from "motion/react"');
    expect(heroSource).toContain("carnet-hero-sans");
    expect(heroSource).toContain("carnet-hero-serif");
    expect(css).toMatch(
      /\.carnet-hero-sans\s*{[^}]*font-family:\s*ui-sans-serif/s,
    );
    expect(css).toMatch(
      /\.carnet-hero-serif\s*{[^}]*font-family:[^}]*Iowan Old Style/s,
    );
    expect(entryKeyframes).toBeDefined();
    expect(entryKeyframes).not.toContain("opacity");
    expect(photoKeyframes).toContain("scale(1.02)");
    expect(photoKeyframes).not.toContain("opacity");
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-entry\s*\{[^}]*animation:/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-photo\s*\{[^}]*animation:/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-hero-entry/,
    );
  });
});
