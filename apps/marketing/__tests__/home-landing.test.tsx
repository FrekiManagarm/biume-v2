// apps/marketing/__tests__/home-landing.test.tsx
import { describe, expect, mock, test } from "bun:test";

import {
  CLOSE_TITLE,
  CONTROL_LEAD,
  CONTROL_TITLE,
  FAQ,
  FOLLOW_UP_TITLE,
  HERO_TITLE,
  SPECIMEN_NOTE,
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

describe("Biume homepage (landing-v5)", () => {
  test("uses the landing-v5 composition for the approved homepage story", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = ["produit", "controle", "suivi", "proprietaire", "tarifs", "questions"];

    expect(html).toContain('class="landing-v5 ');
    for (const marker of markers) {
      expect(html.match(new RegExp(`id="${marker}"`, "g"))).toHaveLength(1);
    }
  });

  test("renders the complete factual story, prices, FAQ and final conversions", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain(HERO_TITLE);
    expect(text).toContain(SPECIMEN_NOTE);
    expect(text).toContain(CONTROL_TITLE);
    expect(text).toContain(CONTROL_LEAD);
    expect(text).toContain(FOLLOW_UP_TITLE);
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("atelier-owner.webp");
    // Le prix annuel n'apparaît qu'après bascule du sélecteur côté client
    // (voir landing-v5-pricing.test.tsx) ; seul le mensuel est rendu ici.
    expect(html).toContain("29,99 €");
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
    for (const target of ["produit", "suivi", "proprietaire", "tarifs", "questions"]) {
      expect(navigationTargets).toContain(target);
    }
    for (const target of new Set(navigationTargets)) {
      expect(ids.filter((id) => id === target)).toHaveLength(1);
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
    expect(firstAnchor).toContain("focus:not-sr-only");
    expect(firstAnchor).toContain("focus:bg-[color:var(--lv5-violet)]");
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
    expect(html).not.toContain("carnet-theme");
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
    expect(
      schemas.some((schema) => schema["@type"] === "SoftwareApplication"),
    ).toBe(false);
    expect(faqPage).toBeDefined();
    expect((faqPage?.mainEntity as unknown[] | undefined)?.length).toBe(FAQ.length);
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
