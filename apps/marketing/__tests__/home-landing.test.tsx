import { describe, expect, mock, test } from "bun:test";

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

mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
}));

const { default: HomePage } = await import("../app/page");

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

function landingSectionTag(html: string, id: string) {
  return html.match(
    new RegExp(`<section\\b[^>]*data-landing-section="${id}"[^>]*>`),
  )?.[0];
}

describe("Biume Carnet vivant homepage", () => {
  test("assembles the eight ordered living-system sections", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="reassurance"',
      'data-landing-section="daily-flow"',
      'data-landing-section="transformation"',
      'data-landing-section="follow-up"',
      'data-landing-section="control"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ];

    expect(html).toContain("carnet-theme");
    expect(html.match(/data-landing-section=/g)).toHaveLength(8);
    expect(html).not.toContain('data-landing-section="product-proof"');
    for (const marker of markers) {
      expect(html).toContain(marker);
    }
    for (let index = 1; index < markers.length; index += 1) {
      expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
        html.indexOf(markers[index]!),
      );
    }
  });

  test("keeps the mobile narrative inside the approved height budget", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const hero = landingSectionTag(html, "hero");

    expect(hero).toBeDefined();
    expect(hero).toContain("pb-10");
    for (const id of [
      "daily-flow",
      "transformation",
      "follow-up",
      "pricing",
      "faq-cta",
    ]) {
      const section = landingSectionTag(html, id);

      expect(section).toBeDefined();
      expect(section).toContain("py-10");
      expect(section).toContain("md:py-20");
    }
  });

  test("renders the approved living-system promise, proof, offer and close", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    for (const copy of [
      "Votre journée, mieux orchestrée",
      "Moins d’administratif. Plus de temps pour soigner.",
      "Biume transforme vos notes en comptes rendus précis et clairs, puis garde le fil du suivi propriétaire.",
      "15 jours pour tout tester",
      "Sans carte bancaire",
      "Rien ne part sans votre validation",
      "Une journée de cabinet, sans ressaisie.",
      "Précis pour vous. Clair pour le propriétaire.",
      "Votre observation reste la source.",
      "Le suivi ne repose plus sur votre mémoire.",
      "Biume prépare. Vous décidez.",
      "Une offre. Deux rythmes.",
      "Testez tout le parcours pendant 15 jours.",
      "Retrouvez du temps dès votre prochaine séance.",
    ]) {
      expect(text).toContain(copy);
    }
    for (const step of ["Séance", "Notes", "Compte rendu", "Partage", "Suivi"]) {
      expect(text).toContain(step);
    }
    expect(text).toContain(REPORT_NOTE_SUMMARY);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html.match(/data-report-note(?:=|\s|>)/g)).toHaveLength(1);
    expect(html.match(/data-report-bridge(?:=|\s|>)/g)).toHaveLength(1);
    expect(html.match(/data-report-document(?:=|\s|>)/g)).toHaveLength(1);
    expect(html).not.toContain("Pas une promesse abstraite.");
    expect(html).not.toContain("Les outils réellement disponibles.");
    expect(html).not.toContain("data-product-output=");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");
    expect(html.match(/<details/g)).toHaveLength(6);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("keeps homepage ids unique and every navigation anchor live", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    const navigationTargets = [
      ...html.matchAll(/\shref="#([^"]+)"/g),
    ].map((match) => match[1]!);

    expect(new Set(ids).size).toBe(ids.length);
    expect(navigationTargets).toContain("produit");
    expect(navigationTargets).toContain("comment-ca-marche");
    for (const target of new Set(navigationTargets)) {
      expect(ids.filter((id) => id === target)).toHaveLength(1);
    }
  });

  test("maps every stable conversion hook to the signup application", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const expectedSignupCounts = {
      "header-signup": 2,
      "hero-signup": 1,
      "pricing-signup": 1,
      "final-signup": 1,
    } as const;

    for (const [id, count] of Object.entries(expectedSignupCounts)) {
      const anchors = conversionAnchors(html, id);
      expect(anchors).toHaveLength(count);
      for (const anchor of anchors) {
        expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
      }
    }

    const expectedDemoCounts = {
      "header-demo": 2,
      "hero-demo": 1,
      "faq-demo": 1,
    } as const;

    for (const [id, count] of Object.entries(expectedDemoCounts)) {
      const anchors = conversionAnchors(html, id);
      expect(anchors).toHaveLength(count);
      for (const anchor of anchors) {
        expect(anchor).toContain(
          'href="https://cal.com/mathieu-chambaud-biume"',
        );
        expect(anchor).toContain('target="_blank"');
      }
    }
  });

  test("keeps the homepage free of unsupported or broken claims", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = html.toLowerCase();

    for (const forbidden of [
      "timeline animal",
      "retour à j+7",
      "naya va mieux depuis la séance",
      "réponse propriétaire centralisée",
      "questionnaire automatique",
      "4.9/5",
      "hébergé en france",
      "conforme au RGPD",
      'href="/contact"',
      "bg-clip-text",
    ]) {
      expect(normalized).not.toContain(forbidden.toLowerCase());
    }
  });

  test("keeps the home schema factual and service-shaped", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");

    expect(service).toBeDefined();
    expect(service?.description).toBe(
      "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
    );
    expect(
      schemas.some((schema) => schema["@type"] === "SoftwareApplication"),
    ).toBe(false);
    expect(service?.offers).toBeUndefined();
  });

  test("limits client hydration to the four interactive islands", async () => {
    const clientIslands = [
      "../components/landing/header-motion.tsx",
      "../components/landing/living-system-scene.tsx",
      "../components/landing/report-transformation-story.tsx",
      "../components/landing/pricing-selector.tsx",
    ];
    const serverComponents = [
      "../components/landing/landing-header.tsx",
      "../components/landing/landing-hero.tsx",
      "../components/landing/daily-flow.tsx",
      "../components/landing/follow-up-story.tsx",
      "../components/landing/practitioner-control.tsx",
      "../components/landing/product-proof.tsx",
      "../components/landing/pricing-decision.tsx",
      "../components/landing/landing-faq.tsx",
      "../components/landing/final-cta.tsx",
    ];

    for (const path of clientIslands) {
      const source = await Bun.file(new URL(path, import.meta.url)).text();
      expect(source).toMatch(/^"use client";/);
    }
    for (const path of serverComponents) {
      const source = await Bun.file(new URL(path, import.meta.url)).text();
      expect(source).not.toContain('"use client"');
    }
  });

  test("uses stable system font stacks without delaying first paint", async () => {
    const [source, layoutSource, css] = await Promise.all([
      Bun.file(new URL("../app/page.tsx", import.meta.url)).text(),
      Bun.file(new URL("../app/layout.tsx", import.meta.url)).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
    ]);

    expect(source).not.toContain("next/font/google");
    expect(layoutSource).not.toContain("next/font/google");
    expect(css).toMatch(/--font-geist-sans:\s*ui-sans-serif/);
    expect(css).toMatch(/--font-geist-mono:\s*ui-monospace/);
    expect(css).toMatch(/--font-newsreader:[^;]*Iowan Old Style/s);
  });

  test("does not assemble the standalone product proof", async () => {
    const source = await Bun.file(
      new URL("../app/page.tsx", import.meta.url),
    ).text();

    expect(source).not.toContain("ProductProof");
  });

  test("scopes Tailwind discovery to each owning application", async () => {
    const [sharedCss, marketingCss, webCss] = await Promise.all([
      Bun.file(
        new URL(
          "../../../packages/ui/src/styles/globals.css",
          import.meta.url,
        ),
      ).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
      Bun.file(new URL("../../web/src/styles.css", import.meta.url)).text(),
    ]);

    expect(sharedCss).toContain('@import "tailwindcss" source(none)');
    expect(sharedCss).not.toContain('@source "../../../apps/**/*.{ts,tsx}"');
    expect(sharedCss).not.toContain('@source "../**/*.{ts,tsx}"');
    expect(marketingCss).toContain('@source "../**/*.{ts,tsx,mdx}"');
    expect(marketingCss).toContain(
      '@source "../../../packages/ui/src/components/{button,dropdown-menu,tooltip}.tsx"',
    );
    expect(webCss).toContain('@source "./**/*.{ts,tsx}"');
    expect(webCss).toContain(
      '@source "../../../packages/ui/src/**/*.{ts,tsx}"',
    );
  });

  test("inlines the route CSS on the critical render path", async () => {
    const config = await Bun.file(
      new URL("../next.config.ts", import.meta.url),
    ).text();

    expect(config).toContain("inlineCss: true");
  });
});
