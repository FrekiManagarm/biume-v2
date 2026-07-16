import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeaderMotion } from "../components/landing/header-motion";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
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

  test("hero renders the approved living-system composition and conversions", () => {
    const html = renderWithLandingImageConfig(<LandingHero />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "hero-signup");
    const demoAnchors = conversionAnchors(html, "hero-demo");
    const heroImage = html.match(
      /<img\b(?=[^>]*hero-practitioner-horse\.png)[^>]*>/,
    )?.[0];

    for (const copy of [
      "Votre journée, mieux orchestrée",
      "Moins d’administratif. Plus de temps pour soigner.",
      "Biume transforme vos notes en comptes rendus précis et clairs, puis garde le fil du suivi propriétaire.",
      "Essayer gratuitement",
      "Réserver une démo",
    ]) {
      expect(text).toContain(copy);
    }
    expect(heroImage).toBeDefined();
    expect(heroImage?.toLowerCase()).toContain('fetchpriority="high"');
    expect(heroImage).toContain("q=65");
    expect(heroImage).toContain(
      'sizes="(min-width: 1504px) 1408px, (min-width: 1024px) calc(100vw - 96px), (min-width: 640px) calc(100vw - 80px), calc(100vw - 53px)"',
    );
    expect(html).toContain("data-living-system-scene");
    expect(html.match(/data-system-document=/g)).toHaveLength(3);
    expect(html.match(/data-system-orbit=/g)).toHaveLength(1);
    expect(text).toContain("Note de séance");
    expect(text).toContain("Compte rendu clair");
    expect(text).toContain("Suivi planifié");
    expect(signupAnchors).toHaveLength(1);
    expect(demoAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(demoAnchors[0]).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(demoAnchors[0]).toContain('target="_blank"');
    expect(demoAnchors[0]).toContain('rel="noopener noreferrer"');
    expect(html).toContain(
      '<span class="sr-only"> (ouvre un nouvel onglet)</span>',
    );
    expect(text).not.toContain("15 jours d’essai");
    expect(text).not.toContain("Sans carte bancaire");
    expect(text).not.toContain("Rien ne part sans vous");
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("living-system motion cycles from explicit base transforms", async () => {
    const sceneModule = await import(
      "../components/landing/living-system-scene"
    );
    const orbitMotion = sceneModule.LIVING_SYSTEM_ORBIT_MOTION;
    const documentMotions = sceneModule.LIVING_SYSTEM_DOCUMENT_MOTIONS;

    expect(orbitMotion).toBeDefined();
    expect(orbitMotion?.initial).toEqual({ rotate: -7 });
    expect(orbitMotion?.animate).toEqual({ rotate: [-7, 353] });
    expect(orbitMotion?.transition).toMatchObject({
      type: "spring",
      stiffness: 100,
      damping: 20,
      repeat: Infinity,
    });

    const expectedDocuments = [
      { baseRotation: -2, drift: -8, delta: -0.7 },
      { baseRotation: 1.2, drift: -10, delta: 0.6 },
      { baseRotation: 2, drift: -7, delta: 0.8 },
    ] as const;

    expect(documentMotions).toHaveLength(expectedDocuments.length);
    for (const [index, expected] of expectedDocuments.entries()) {
      const motion = documentMotions?.[index];
      expect(motion?.initial).toEqual({
        y: 0,
        rotate: expected.baseRotation,
      });
      expect(motion?.animate).toEqual({
        y: [0, expected.drift, 0],
        rotate: [
          expected.baseRotation,
          expected.baseRotation + expected.delta,
          expected.baseRotation,
        ],
      });
      expect(motion?.transition).toMatchObject({
        type: "spring",
        stiffness: 100,
        damping: 20,
        repeat: Infinity,
      });
    }
  });

  test("living-system motion is isolated, transform-only, and accessible", async () => {
    const heroSource = await Bun.file(
      new URL("../components/landing/landing-hero.tsx", import.meta.url),
    ).text();
    const sceneFile = Bun.file(
      new URL(
        "../components/landing/living-system-scene.tsx",
        import.meta.url,
      ),
    );
    expect(await sceneFile.exists()).toBe(true);
    const sceneSource = await sceneFile.text();
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();
    const newHeroSources = `${heroSource}\n${sceneSource}`;

    expect(heroSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(heroSource).not.toMatch(/from\s+["']motion\/react["']/);
    expect(heroSource).toContain("export function LandingHero()");
    expect(sceneSource).toMatch(/^"use client";/);
    expect(sceneSource).toContain('from "motion/react"');
    for (const motionApi of [
      "domAnimation",
      "LazyMotion",
      "m",
      "useReducedMotion",
    ]) {
      expect(sceneSource).toContain(motionApi);
    }
    expect(sceneSource).toContain('import { memo } from "react"');
    expect(sceneSource).toContain("repeat: Infinity");
    expect(sceneSource).toContain('type: "spring"');
    expect(sceneSource).toContain("stiffness: 100");
    expect(sceneSource).toContain("damping: 20");
    expect(sceneSource).toMatch(/if\s*\(reduceMotion\)\s*\{[\s\S]*?return/);
    expect(sceneSource).not.toContain("initial={false}");
    expect(sceneSource).not.toMatch(
      /\b(?:animate|initial|exit)\s*=\s*\{\{[^}]*\b(?:top|left|width|height)\s*:/s,
    );
    expect(sceneSource).not.toContain("useState");
    expect(css).toContain("--carnet-violet: #6b5ac8;");
    expect(css).toContain("--carnet-blue: #5d9bb8;");
    expect(css).toContain("--carnet-green: #2e9866;");
    expect(css).toContain(".living-system-scene");
    expect(css).toContain(".living-system-orbit");
    expect(css).toContain(".living-system-document");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.living-system-orbit,[\s\S]*?\.living-system-document\s*\{[^}]*animation:\s*none;[^}]*transition:\s*none;/,
    );
    expect(newHeroSources).not.toMatch(
      /(?:bg-clip-text|text-transparent|background-clip:\s*text)/,
    );
    expect(newHeroSources).not.toMatch(/shadow-\[0_0|\bglow\b/i);
    expect(newHeroSources).not.toMatch(
      /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
    );
  });
});
