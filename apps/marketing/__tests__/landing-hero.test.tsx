import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeaderMotion } from "../components/landing/header-motion";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import {
  REPORT_NOTE_SUMMARY,
  REPORT_TRANSFORMATION_DEMO,
} from "../components/landing/report-transformation-demo";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("Carnet vivant header and hero", () => {
  test("header motion compacts with Motion and preserves reduced motion", async () => {
    const source = await Bun.file(
      new URL("../components/landing/header-motion.tsx", import.meta.url),
    ).text();
    const landingHeaderSource = await Bun.file(
      new URL("../components/landing/landing-header.tsx", import.meta.url),
    ).text();
    const html = renderToStaticMarkup(
      <HeaderMotion>
        <a href="/signup">Essayer</a>
      </HeaderMotion>,
    );
    const surfaceClass = html.match(
      /data-header-surface[^>]*class="([^"]*)"/,
    )?.[1];

    expect(source).toMatch(/^"use client";/);
    expect(source).toContain('from "motion/react"');
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("useScroll");
    expect(source).toContain("useTransform");
    expect(source).toContain("useTransform(scrollY, [0, 120], [0, -3])");
    expect(source).toContain("useTransform(scrollY, [0, 120], [1, 0.985])");
    expect(source).toContain(
      "useTransform(scrollY, [0, 120], [0.92, 0.98])",
    );
    expect(source).toContain("style={reduceMotion ? undefined : { y, scale }}");
    expect(source).toContain("opacity: reduceMotion ? 0.98 : surfaceOpacity");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(landingHeaderSource).not.toContain("use client");
    expect(html).toContain("data-header-motion");
    expect(html).toContain("data-header-surface");
    expect(html).toContain("Essayer");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
    expect(surfaceClass).toContain("inset-x-3 top-3 bottom-0");
    expect(surfaceClass?.split(/\s+/)).not.toContain("inset-3");
  });

  test("homepage header keeps trial dominant and demo available", () => {
    const html = renderWithLandingImageConfig(<LandingHeader />);
    const signupAnchors = conversionAnchors(html, "header-signup");
    const demoAnchors = conversionAnchors(html, "header-demo");

    for (const label of [
      "Produit",
      "Comment ça marche",
      "Tarifs",
      "Ressources",
      "Connexion",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Navigation mobile");
    expect(
      html.match(
        /<span class="sr-only"> \(ouvre un nouvel onglet\)<\/span>/g,
      ),
    ).toHaveLength(2);
    expect(signupAnchors).toHaveLength(2);
    expect(demoAnchors).toHaveLength(2);
    for (const anchor of signupAnchors) {
      expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
    }
    for (const anchor of demoAnchors) {
      expect(anchor).toContain(
        'href="https://cal.com/mathieu-chambaud-biume"',
      );
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });

  test("hero renders the approved living-report composition", () => {
    const html = renderWithLandingImageConfig(
      <LandingHero
        adaptedProposal={REPORT_TRANSFORMATION_DEMO.adaptedProposal}
      />,
    );
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "hero-signup");

    expect(html).toContain("Le lien après la séance");
    expect(text).toContain(
      "Vos observations restent précises. Le propriétaire, lui, comprend.",
    );
    expect(html).toContain(
      "Biume part de vos mots, structure un compte rendu clair, puis vous aide à garder le fil après la séance. Vous relisez et décidez de chaque envoi.",
    );
    expect(html).toContain("Voir le parcours");
    expect(html).toContain("15 jours d’essai");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Rien ne part sans vous");
    expect(text).toContain(REPORT_NOTE_SUMMARY);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("Compte rendu propriétaire");
    expect(html).toContain("Prêt à relire");
    expect(html).toContain("Vous pouvez encore modifier ce texte");
    expect(html).not.toContain("Partager le PDF");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).toContain("q=55");
    expect(html).toContain('loading="lazy"');
    expect(html.toLowerCase()).not.toContain('fetchpriority="high"');
    expect(html).not.toContain('rel="preload" as="image"');
    expect(html.match(/data-hero-note=/g)).toHaveLength(1);
    expect(html.match(/data-hero-report=/g)).toHaveLength(1);
    expect(html.match(/data-hero-brand-rail=/g)).toHaveLength(1);
    expect(html.match(/data-hero-journey=/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Parcours : séance, PDF, suivi"');
    expect(text).toContain("SÉANCE");
    expect(text).toContain("PDF");
    expect(text).toContain("SUIVI");
    expect(text).not.toContain("Notes → compte rendu → suivi");
    const photoClass = html.match(
      /data-hero-photo[^>]*class="([^"]*)"/,
    )?.[1];
    expect(photoClass).toBeDefined();
    expect(photoClass).not.toMatch(/(?:^|\s)hidden(?:\s|$)/);
    const journeyClass = html.match(
      /data-hero-journey[^>]*class="([^"]*)"/,
    )?.[1];
    expect(journeyClass).toBeDefined();
    expect(journeyClass).toMatch(/(?:^|\s)hidden(?:\s|$)/);
    expect(journeyClass).toMatch(/(?:^|\s)xl:block(?:\s|$)/);
    expect(journeyClass).not.toMatch(/(?:^|\s)(?:sm|lg):block(?:\s|$)/);
    expect(html).toMatch(/<div[^>]*data-hero-journey/);
    expect(html).toMatch(
      /<ol[^>]*aria-label="Parcours : séance, PDF, suivi"/,
    );
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
    const noteKeyframes = css.match(
      /@keyframes landing-hero-note\s*{([\s\S]*?)\n}/,
    )?.[1];
    const reportKeyframes = css.match(
      /@keyframes landing-hero-report\s*{([\s\S]*?)\n}/,
    )?.[1];

    expect(heroSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(heroSource).not.toMatch(/from\s+["']motion\/react["']/);
    expect(heroSource).toContain("REPORT_NOTE_SUMMARY");
    expect(heroSource).toContain("data-hero-brand-rail");
    expect(heroSource).toContain("linear-gradient");
    expect(heroSource).toContain("var(--carnet-logo-violet)");
    expect(heroSource).toContain("var(--carnet-logo-blue)");
    expect(heroSource).toContain("var(--carnet-logo-green)");
    expect(heroSource).toContain("carnet-hero-sans");
    expect(heroSource).toContain("carnet-hero-serif");
    expect(css).toMatch(/--carnet-logo-violet:\s*#8e82e8;/);
    expect(css).toMatch(/--carnet-logo-blue:\s*#62a8c8;/);
    expect(css).toMatch(/--carnet-logo-green:\s*#28c978;/);
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
    expect(noteKeyframes).toContain(
      "translate3d(-14px, 12px, 0) rotate(-1deg)",
    );
    expect(noteKeyframes).toContain("translate3d(0, 0, 0) rotate(0deg)");
    expect(reportKeyframes).toContain(
      "translate3d(18px, 16px, 0) scale(0.985)",
    );
    expect(reportKeyframes).toContain(
      "translate3d(0, 0, 0) scale(1)",
    );
    for (const keyframes of [noteKeyframes, reportKeyframes]) {
      expect(keyframes).toBeDefined();
      expect(keyframes).not.toMatch(/opacity|\btop\b|\bleft\b|\bwidth\b|\bheight\b/);
    }
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-entry\s*\{[^}]*animation:/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-photo\s*\{[^}]*animation:/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-note\s*\{[^}]*animation:\s*landing-hero-note 620ms[^;}]*260ms\s+both;/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.landing-hero-report\s*\{[^}]*animation:\s*landing-hero-report 720ms[^;}]*360ms\s+both;/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-hero-entry/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-hero-note,[\s\S]*\.landing-hero-report\s*\{[^}]*animation:\s*none;/,
    );
  });
});
