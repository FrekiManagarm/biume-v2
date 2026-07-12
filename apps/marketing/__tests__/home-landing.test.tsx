import { describe, expect, mock, test } from "bun:test";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
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

describe("Biume Carnet vivant homepage", () => {
  test("assembles five ordered conversion moments", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="transformation"',
      'data-landing-section="product-proof"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ];

    expect(html).toContain("carnet-theme");
    expect(html.match(/data-landing-section=/g)).toHaveLength(5);
    for (const marker of markers) {
      expect(html).toContain(marker);
    }
    for (let index = 1; index < markers.length; index += 1) {
      expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
        html.indexOf(markers[index]!),
      );
    }
  });

  test("renders the approved promise, report story, proof, price and close", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain("Vos observations, dans des mots qui restent.");
    expect(text).toContain(
      "Une note devient un document que le propriétaire peut comprendre.",
    );
    expect(html.match(/data-report-state=/g)).toHaveLength(4);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.observation);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("PDF professionnel");
    expect(html).toContain("Relance de rendez-vous");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");
    expect(html.match(/<details/g)).toHaveLength(6);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    expect(text).toContain("La séance est terminée. Le suivi peut commencer.");
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("maps every stable conversion hook to the signup application", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const expectedCounts = {
      "header-signup": 2,
      "hero-signup": 1,
      "pricing-signup": 1,
      "final-signup": 1,
    } as const;

    for (const [id, count] of Object.entries(expectedCounts)) {
      const anchors = conversionAnchors(html, id);
      expect(anchors).toHaveLength(count);
      for (const anchor of anchors) {
        expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
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

  test("limits new client boundaries to the three approved islands", async () => {
    const clientIslands = [
      "../components/landing/header-motion.tsx",
      "../components/landing/report-transformation-story.tsx",
      "../components/landing/pricing-selector.tsx",
    ];
    const serverComponents = [
      "../components/landing/landing-header.tsx",
      "../components/landing/landing-hero.tsx",
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
});
