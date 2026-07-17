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
  Hanken_Grotesk: () => ({ variable: "font-hanken" }),
}));

const { default: HomePage } = await import("../app/page");

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

describe("Biume atelier precision homepage", () => {
  test("assembles the seven approved sections once and in order", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="transformation"',
      'data-landing-section="control"',
      'data-landing-section="follow-up"',
      'data-landing-section="use-moments"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ] as const;

    expect(html).toContain("atelier-theme");
    expect(html.match(/data-landing-section=/g)).toHaveLength(markers.length);
    for (const marker of markers) {
      expect(html.match(new RegExp(marker, "g"))).toHaveLength(1);
    }
    for (let index = 1; index < markers.length; index += 1) {
      expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
        html.indexOf(markers[index]!),
      );
    }
  });

  test("renders the complete factual story, prices, FAQ and final conversions", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain("Votre regard métier, jusqu’au propriétaire.");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.note);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.ownerSummary);
    expect(text).toContain("Biume prépare. Vous gardez la main.");
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(text).toContain("La séance se termine. Le suivi se prépare.");
    expect(text).toContain("Trois moments où Biume fait la différence.");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    expect(text).toContain("Prêt à transformer votre prochain compte rendu ?");
    expect(html).toContain("practitioner-owner-animal.png");

    const finalSignup = conversionAnchors(html, "final-signup");
    const finalDemo = conversionAnchors(html, "final-demo");
    expect(finalSignup).toHaveLength(1);
    expect(finalDemo).toHaveLength(1);
    expect(finalSignup[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(finalDemo[0]).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("keeps homepage ids unique and every navigation anchor live", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(
      (match) => match[1]!,
    );
    const navigationTargets = [...html.matchAll(/\shref="#([^"]+)"/g)].map(
      (match) => match[1]!,
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(navigationTargets).toContain("produit");
    expect(navigationTargets).toContain("methode");
    expect(navigationTargets).toContain("tarifs");
    for (const target of new Set(navigationTargets)) {
      expect(ids.filter((id) => id === target)).toHaveLength(1);
    }
  });

  test("puts a keyboard-visible skip link before navigation with a focusable target", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const firstAnchor = html.match(/<a\b[^>]*>/)?.[0];
    const skipLinkIndex = html.indexOf('href="#contenu"');
    const headerIndex = html.indexOf("<header");
    const mainTarget = html.match(/<main\b[^>]*id="contenu"[^>]*>/)?.[0];

    expect(firstAnchor).toContain('href="#contenu"');
    expect(firstAnchor).toContain("sr-only");
    expect(firstAnchor).toContain("focus:not-sr-only");
    expect(firstAnchor).toContain("focus-visible:outline-[color:var(--machine-violet)]");
    expect(skipLinkIndex).toBeGreaterThanOrEqual(0);
    expect(headerIndex).toBeGreaterThan(skipLinkIndex);
    expect(mainTarget).toBeDefined();
    expect(mainTarget).toContain('tabindex="-1"');
  });

  test("keeps the homepage free of superseded UI and unsupported claims", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = textOnly(html).toLowerCase();

    expect(html).not.toContain("carnet-theme");
    expect(html).not.toContain(["Product", "Proof"].join(""));
    expect(html).not.toContain("data-product-output=");
    expect(normalized).not.toMatch(/\b\d(?:[,.]\d)?\s*\/\s*5\b/);
    expect(normalized).not.toMatch(/\b\d+(?:[,.]\d+)?\s*%\b/);
    for (const forbidden of [
      "hébergé en france",
      "conforme au rgpd",
      "envoi automatique au propriétaire",
      "naya va mieux depuis la séance",
      "réponse propriétaire centralisée",
      "questionnaire",
      "retour à j+7",
      "timeline enrichie",
      "suivi ajouté à la timeline",
      "tableau de bord connecté",
    ]) {
      expect(normalized).not.toContain(forbidden);
    }
  });

  test("keeps the unchanged factual Service schema", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");

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
    expect(
      schemas.some((schema) => schema["@type"] === "SoftwareApplication"),
    ).toBe(false);
  });

  test("removes the superseded proof and temporary Carnet compatibility layer", async () => {
    const removedComponent = ["product", "proof"].join("-");
    const removedExport = ["Product", "Proof"].join("");
    const [pageSource, css, productProofExists, productProofTestExists] =
      await Promise.all([
        Bun.file(new URL("../app/page.tsx", import.meta.url)).text(),
        Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
        Bun.file(
          new URL(
            `../components/landing/${removedComponent}.tsx`,
            import.meta.url,
          ),
        ).exists(),
        Bun.file(
          new URL(`./${removedComponent}.test.tsx`, import.meta.url),
        ).exists(),
      ]);

    expect(pageSource).not.toContain(removedExport);
    expect(pageSource).not.toContain(removedComponent);
    expect(productProofExists).toBe(false);
    expect(productProofTestExists).toBe(false);
    expect(css).not.toMatch(/--carnet-|\.carnet-action/);
  });

  test("keeps scoped Tailwind discovery and inline route CSS", async () => {
    const [sharedCss, marketingCss, webCss, config] = await Promise.all([
      Bun.file(
        new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
      ).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
      Bun.file(new URL("../../web/src/styles.css", import.meta.url)).text(),
      Bun.file(new URL("../next.config.ts", import.meta.url)).text(),
    ]);

    expect(sharedCss).toContain('@import "tailwindcss" source(none)');
    expect(marketingCss).toContain('@source "../**/*.{ts,tsx,mdx}"');
    expect(webCss).toContain('@source "./**/*.{ts,tsx}"');
    expect(config).toContain("inlineCss: true");
  });
});
