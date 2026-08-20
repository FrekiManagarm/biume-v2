// apps/marketing/__tests__/home-landing.test.tsx
import { describe, expect, mock, test } from "bun:test";

import {
  CLOSE_TITLE,
  FAQ,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  TABS_NOTE,
} from "../components/landing-v5/content";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

mock.module("next/font/google", () => ({
  Hanken_Grotesk: () => ({ variable: "font-hanken" }),
  Geist: () => ({ variable: "font-v2-sans" }),
  Geist_Mono: () => ({ variable: "font-v2-mono" }),
}));

const { default: HomePage } = await import("../app/page");

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

describe("Biume homepage (landing-v5, SaaS moderne)", () => {
  test("uses the new landing-v5 composition for the approved homepage story", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      "produit",
      "fonctions",
      "mobile",
      "proprietaire",
      "suivi",
      "limites",
      "tarifs",
      "questions",
    ];

    expect(html).toContain('class="landing-v5 ');
    for (const marker of markers) {
      expect(html.match(new RegExp(`id="${marker}"`, "g"))).toHaveLength(1);
    }
  });

  test("renders the hero title, the report demo disclaimer, prices and FAQ", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain(HERO_TITLE_LINE_1);
    expect(text).toContain(HERO_TITLE_LINE_2);
    expect(text).toContain(TABS_NOTE);
    expect(text).toContain("29,99 €");
    expect(html.match(/data-slot="accordion-item"/g)).toHaveLength(FAQ.length);
    expect(text).toContain(CLOSE_TITLE);

    const finalSignup = conversionAnchors(html, "close-signup");
    expect(finalSignup).toHaveLength(1);
    expect(finalSignup[0]).toContain(`href="${webAppPath("/signup")}"`);
  });

  test("keeps homepage ids unique and every navigation anchor live", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    const navigationTargets = [...html.matchAll(/\shref="#([^"]+)"/g)].map(
      (match) => match[1]!,
    );

    expect(new Set(ids).size).toBe(ids.length);
    for (const target of ["produit", "fonctions", "mobile", "tarifs", "questions"]) {
      expect(navigationTargets).toContain(target);
    }
  });

  test("puts a keyboard-visible skip link before navigation with a focusable target", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const firstAnchor = html.match(/<a\b[^>]*>/)?.[0];
    const skipLinkIndex = html.indexOf('href="#contenu"');
    const navigationIndex = html.indexOf('aria-label="Navigation principale"');
    const mainTarget = html.match(/<main\b[^>]*id="contenu"[^>]*>/)?.[0];

    expect(firstAnchor).toContain('href="#contenu"');
    expect(firstAnchor).toContain("sr-only");
    expect(skipLinkIndex).toBeGreaterThanOrEqual(0);
    expect(navigationIndex).toBeGreaterThan(skipLinkIndex);
    expect(mainTarget).toBeDefined();
    expect(mainTarget).toContain('tabindex="-1"');
  });

  test("never promises an elapsed time and never invents social proof", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = textOnly(html).toLowerCase();

    expect(normalized).not.toMatch(/moins de cinq minutes/);
    expect(normalized).not.toMatch(/témoignage|avis client|utilisateurs actifs/);
  });

  test("keeps the unchanged factual Service schema and adds the FAQPage schema", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");
    const faqPage = schemas.find((schema) => schema["@type"] === "FAQPage");

    expect(service).toEqual({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Biume",
      url: "https://biume.com",
      description:
        "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
      provider: {
        "@type": "Organization",
        name: "Biume",
        url: "https://biume.com",
      },
      areaServed: "FR",
    });
    expect(faqPage).toBeDefined();
    expect((faqPage?.mainEntity as unknown[] | undefined)?.length).toBe(FAQ.length);
  });

  test("removes the retired 'Le parcours' markers entirely", () => {
    const html = renderWithLandingImageConfig(<HomePage />);

    expect(html).not.toContain("atelier-practice.webp");
    expect(html).not.toContain("atelier-owner.webp");
    expect(html).not.toMatch(/id="controle"/);
  });
});
