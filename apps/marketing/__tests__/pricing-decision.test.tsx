import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import {
  billingOptions,
  PricingDecision,
} from "../components/landing/pricing-decision";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  textOnly,
} from "./landing-test-utils";

describe("pricing decision", () => {
  test("leads with practitioner control and the annual price", () => {
    const html = renderToStaticMarkup(<PricingDecision />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "pricing-signup");

    expect(text).toContain("Biume prépare. Vous décidez.");
    expect(text).toContain(
      "Biume ne partage rien automatiquement. Vous relisez, corrigez et déclenchez vous-même le partage.",
    );
    expect(html).toContain("24,99 €");
    expect(html).toContain("par mois, facturé annuellement");
    expect(html).toContain("299,88 € facturés une fois par an");
    expect(html).toContain("29,99 € / mois");
    expect(billingOptions.annual).toEqual({
      label: "Annuel",
      selectorPrice: "24,99 € / mois",
      price: "24,99 €",
      suffix: "par mois, facturé annuellement",
      detail: "299,88 € facturés une fois par an",
    });
    expect(billingOptions.monthly).toEqual({
      label: "Mensuel",
      selectorPrice: "29,99 € / mois",
      price: "29,99 €",
      suffix: "par mois",
      detail: "Facturation mensuelle, résiliable en fin de période",
    });
    expect(text).toContain(
      "15 jours pour tester l'ensemble du parcours, sans carte bancaire.",
    );
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("keeps lightweight interaction inside the price selector", async () => {
    const selectorSource = await Bun.file(
      new URL("../components/landing/pricing-selector.tsx", import.meta.url),
    ).text();
    const decisionSource = await Bun.file(
      new URL("../components/landing/pricing-decision.tsx", import.meta.url),
    ).text();

    expect(selectorSource).toContain('"use client"');
    expect(selectorSource).toContain("useState");
    expect(selectorSource).not.toContain('from "motion/react"');
    expect(selectorSource).not.toContain("LazyMotion");
    expect(selectorSource).not.toContain("AnimatePresence");
    expect(selectorSource).not.toContain("repeat: Infinity");
    expect(decisionSource).not.toContain('"use client"');
    expect(decisionSource).not.toContain('from "motion/react"');
  });

  test("keeps the live region mounted around keyed price changes", async () => {
    const selectorSource = await Bun.file(
      new URL("../components/landing/pricing-selector.tsx", import.meta.url),
    ).text();
    const liveRegionIndex = selectorSource.indexOf("data-billing-price");
    const liveRegionTagStart = selectorSource.lastIndexOf("<", liveRegionIndex);
    const liveRegionTagEnd = selectorSource.indexOf(">", liveRegionIndex);
    const liveRegionOpenTag = selectorSource.slice(
      liveRegionTagStart,
      liveRegionTagEnd + 1,
    );
    const keyedPriceIndex = selectorSource.indexOf(
      "key={cycle}",
      liveRegionIndex,
    );

    expect(liveRegionIndex).toBeGreaterThan(-1);
    expect(liveRegionOpenTag).toMatch(/^<div\b/);
    expect(liveRegionOpenTag).not.toContain("key={cycle}");
    expect(keyedPriceIndex).toBeGreaterThan(liveRegionIndex);
  });

  test("disables prefetch for the pricing conversion link", async () => {
    const decisionSource = await Bun.file(
      new URL("../components/landing/pricing-decision.tsx", import.meta.url),
    ).text();

    expect(decisionSource).toContain("prefetch={false}");
  });
});
