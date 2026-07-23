import { describe, expect, mock, test } from "bun:test";

import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

mock.module("next/font/google", () => ({
  DM_Sans: () => ({ variable: "font-v3-sans" }),
  Hanken_Grotesk: () => ({ variable: "font-hanken" }),
}));

const { default: V3Page, metadata } = await import("../app/v3/page");

describe("V3 Clinical Studio landing", () => {
  test("keeps shared landing shell imports compatible with the font mock", async () => {
    const { LandingShell } = await import("../components/landing/landing-shell");

    expect(LandingShell).toBeFunction();
  });

  test("places the workbench in the dedicated product band", () => {
    const html = renderWithLandingImageConfig(<V3Page />);
    const heroIndex = html.indexOf('class="v3-hero"');
    const bandIndex = html.indexOf('class="v3-product-band"');
    const workbenchIndex = html.indexOf('class="v3-workbench-demo"');

    expect(heroIndex).toBeGreaterThanOrEqual(0);
    expect(bandIndex).toBeGreaterThan(heroIndex);
    expect(workbenchIndex).toBeGreaterThan(bandIndex);
    expect(html).toContain("Préparer mon premier compte rendu");
  });

  test("shows a static review state instead of a fake product action", () => {
    const html = renderWithLandingImageConfig(<V3Page />);

    expect(html).toContain("Prêt pour votre relecture");
    expect(html).not.toContain("Relire le compte rendu");
  });

  test("keeps the static workbench free of retired previews and controls", async () => {
    const [landingSource, css] = await Promise.all([
      Bun.file(new URL("../components/v3/v3-landing.tsx", import.meta.url)).text(),
      Bun.file(new URL("../app/v3/v3.css", import.meta.url)).text(),
    ]);
    const html = renderWithLandingImageConfig(<V3Page />);
    const workbenchStart = html.indexOf('<section id="produit"');
    const workbenchEnd = html.indexOf('<section id="controle"');
    const workbenchMarkup = html.slice(workbenchStart, workbenchEnd);

    expect(`${landingSource}\n${css}`).not.toContain("v3-scan");
    expect(`${landingSource}\n${css}`).not.toContain("v3-hero-preview");
    expect(workbenchStart).toBeGreaterThanOrEqual(0);
    expect(workbenchEnd).toBeGreaterThan(workbenchStart);
    expect(workbenchMarkup).toContain('role="group"');
    expect(workbenchMarkup).not.toContain("<button");
    expect(workbenchMarkup).not.toMatch(/<a(?=[\s>])/);
    expect(workbenchMarkup).not.toContain("href=");
    expect(workbenchMarkup).not.toContain("v3-static-affordance");
  });

  test("uses the reference-locked canvas, CTA and product-band roles", async () => {
    const css = await Bun.file(new URL("../app/v3/v3.css", import.meta.url)).text();
    const html = renderWithLandingImageConfig(<V3Page />);

    expect(css).toContain("--v3-paper: #ffffff");
    expect(css).toContain("--v3-carbon: #181925");
    expect(css).toContain("--v3-fog: #e8e8e8");
    expect(css).toContain("--v3-lavender: #918df6");
    expect(css).toContain(".v3-product-band");
    expect(css).toContain("linear-gradient");
    expect(css).not.toContain("--v3-signal");
    expect(css).not.toContain("v3-scan");
    expect(html).toContain('class="v3-product-band"');
    expect(html).toContain("Une démonstration de votre espace de travail.");

    const productEyebrowRule = css.match(
      /\.v3-product-band \.v3-eyebrow\s*{([^}]*)}/,
    )?.[1];

    expect(productEyebrowRule).toContain("background: var(--v3-paper)");
    expect(productEyebrowRule).toContain("color: var(--v3-carbon)");
    expect(productEyebrowRule).not.toContain("var(--v3-lavender)");
  });

  test("keeps lavender limited to conversion and the product atmosphere", async () => {
    const css = await Bun.file(new URL("../app/v3/v3.css", import.meta.url)).text();
    const conversionRule = css.match(
      /\.v3-header-signup,\s*\.v3-primary-action\s*{([^}]*)}/,
    )?.[1];
    const conversionHoverRule = css.match(
      /\.v3-header-signup:hover,\s*\.v3-primary-action:hover\s*{([^}]*)}/,
    )?.[1];
    const productBandRule = css.match(/\.v3-product-band\s*{([^}]*)}/)?.[1];
    const lavenderRuleSelectors = [
      ...css.matchAll(/([^{}]+)\{([^{}]*var\(--v3-lavender\)[^{}]*)}/g),
    ].map((match) => match[1].trim());

    expect(conversionRule).toContain("background: var(--v3-lavender)");
    expect(conversionRule).toContain("color: var(--v3-carbon)");
    expect(conversionHoverRule).toContain("color: var(--v3-carbon)");
    expect(productBandRule).toContain("linear-gradient");
    expect(lavenderRuleSelectors).toEqual([
      ".v3-header-signup,\n.v3-primary-action",
      ".v3-product-band",
      ".v3-product-band .v3-demo-trace i",
    ]);
  });

  test("keeps V3 data surfaces flat with Fog borders instead of shadows", async () => {
    const css = await Bun.file(new URL("../app/v3/v3.css", import.meta.url)).text();

    expect(css).toContain("border: 1px solid var(--v3-fog)");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("--v3-mint");
  });

  test("uses one geometric sans-serif family for the V3 interface", async () => {
    const source = await Bun.file(
      new URL("../components/v3/v3-landing.tsx", import.meta.url),
    ).text();
    const css = await Bun.file(new URL("../app/v3/v3.css", import.meta.url)).text();

    expect(source).toContain('import { DM_Sans } from "next/font/google"');
    expect(source).not.toContain("Fraunces");
    expect(source).not.toContain("Instrument_Sans");
    expect(css).not.toContain("--font-v3-display");
  });

  test("keeps the skip link outside the lavender conversion role", async () => {
    const css = await Bun.file(
      new URL("../app/v3/v3.css", import.meta.url),
    ).text();
    const skipLinkRule = css.match(/\.v3 \.v3-skip-link\s*{([^}]*)}/)?.[1];

    expect(skipLinkRule).toBeDefined();
    expect(skipLinkRule).not.toContain("background: var(--v3-lavender)");
    expect(skipLinkRule).toContain("color: var(--v3-paper)");
  });

  test("uses contrast-safe focus and tiny-label roles", async () => {
    const css = await Bun.file(
      new URL("../app/v3/v3.css", import.meta.url),
    ).text();
    const focusRule = css.match(
      /\.v3-focus-ring:focus-visible,\s*\.v3 a:focus-visible\s*{([^}]*)}/,
    )?.[1];
    const sampleLabelRule = css.match(
      /\.v3-stage-sample > span\s*{([^}]*)}/,
    )?.[1];
    const footerFocusRule = css.match(
      /\.v3-footer a:focus-visible\s*{([^}]*)}/,
    )?.[1];

    expect(focusRule).toContain("outline: 3px solid var(--v3-carbon)");
    expect(sampleLabelRule).toContain("color: var(--v3-graphite)");
    expect(footerFocusRule).toContain("outline-color: var(--v3-paper)");
  });

  test("removes retired display and animation concepts from the styles", async () => {
    const css = await Bun.file(
      new URL("../app/v3/v3.css", import.meta.url),
    ).text();

    expect(css).not.toMatch(/font-family:[^;]*(?:,\s*serif\b|\bserif\s*,)/);
    expect(css).not.toContain("--font-v3-display");
    expect(css).not.toContain("v3-scan");
    expect(css).not.toContain("v3-heading-reveal");
  });

  test("keeps V3 brand and skip links as 44px touch targets", async () => {
    const css = await Bun.file(
      new URL("../app/v3/v3.css", import.meta.url),
    ).text();

    expect(css).toMatch(
      /\.v3-brand,[\s\S]*\.v3-footer > a\s*{[\s\S]*min-height:\s*2\.75rem;[\s\S]*min-width:\s*2\.75rem;/,
    );
    expect(css).toMatch(
      /\.v3-skip-link\s*{[\s\S]*display:\s*inline-flex;[\s\S]*min-height:\s*2\.75rem;[\s\S]*min-width:\s*2\.75rem;/,
    );
    expect(css).toMatch(
      /\.v3-nav a\s*{[^}]*min-width:\s*2\.75rem;/,
    );
  });

  test("keeps the route private to experiments", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toContain("Biume");
  });

  test("keeps the approved practitioner workflow and conversion links", () => {
    const html = renderWithLandingImageConfig(<V3Page />);
    const content = textOnly(html);

    expect(content).toContain("Vos notes gardent votre regard.");
    expect(content).toContain("Vous relisez, adaptez et validez");
    expect(content).toContain("ostéopathes animaliers indépendants");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain(`href="${webAppPath("/signin")}"`);
    expect(html).toContain('data-conversion="v3-hero-signup"');
    expect(html).toContain('data-conversion="v3-pricing-signup"');
    expect(html).not.toContain("diagnostic");
    expect(html).not.toContain("guéri");
  });

  test("shows the note-to-validation journey as three labelled stages", () => {
    const html = renderWithLandingImageConfig(<V3Page />);

    for (const label of ["01 — Observer", "02 — Préparer", "03 — Valider"]) {
      expect(html).toContain(label);
    }

    expect(html).toContain('id="fonctionnement"');
    expect(html).toContain(
      'aria-label="Parcours de la note au compte rendu"',
    );
  });

  test("makes annual billing and the approved plan inclusions explicit", () => {
    const content = textOnly(renderWithLandingImageConfig(<V3Page />));

    expect(content).toContain("24,99 € / mois");
    expect(content).toContain("Facturé annuellement.");
    expect(content).toContain("29,99 € sans engagement");
    expect(content).toContain(
      "Reformulation et validation passage par passage",
    );
    expect(content).toContain("Suivi et rappel après séance");
  });
});
