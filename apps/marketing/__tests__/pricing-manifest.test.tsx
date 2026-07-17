import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PricingManifest,
  PRICING_PLANS,
  type PricingPlan,
} from "../components/landing/pricing-manifest";
import { webAppPath } from "../lib/web-app-url";
import { conversionAnchors, textOnly } from "./landing-test-utils";

describe("pricing manifest", () => {
  test("renders one transparent offer without a plan selector", () => {
    const html = renderToStaticMarkup(<PricingManifest />);
    const text = textOnly(html);

    expect(PRICING_PLANS).toHaveLength(1);
    expect(text).toContain("Tout le parcours. Un seul abonnement.");
    expect(text).toContain("24,99 €");
    expect(text).toContain("299,88 € facturés une fois par an");
    expect(text).toContain("29,99 €");
    expect(html).not.toContain("data-plan-selector");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    expect(conversionAnchors(html, "pricing-signup")[0]).toContain(
      `href="${webAppPath("/signup")}"`,
    );
  });

  test("reveals the plan selector when more than one plan exists", () => {
    const second: PricingPlan = {
      ...PRICING_PLANS[0]!,
      id: "collective",
      name: "Collectif",
    };
    const html = renderToStaticMarkup(
      <PricingManifest plans={[PRICING_PLANS[0]!, second]} />,
    );

    expect(html).toContain("data-plan-selector");
    expect(html).toContain("Indépendant");
    expect(html).toContain("Collectif");
  });

  test("keeps plan and billing controls accessible and distinct", async () => {
    const controlsSource = await Bun.file(
      new URL("../components/landing/pricing-controls.tsx", import.meta.url),
    ).text();
    const manifestSource = await Bun.file(
      new URL("../components/landing/pricing-manifest.tsx", import.meta.url),
    ).text();

    expect(controlsSource).toContain('"use client"');
    expect(controlsSource).toContain("data-plan-selector");
    expect(controlsSource).toContain("data-billing-selector");
    expect(controlsSource).toContain("min-h-11");
    expect(controlsSource).toContain('aria-live="polite"');
    expect(controlsSource).toContain('aria-atomic="true"');
    expect(manifestSource).not.toContain('"use client"');
    expect(manifestSource).toContain("prefetch={false}");
  });

  test("renders exact inclusions as separated rows on a full violet section", () => {
    const html = renderToStaticMarkup(<PricingManifest />);
    const text = textOnly(html);

    expect(html).toContain('id="tarifs"');
    expect(html).toContain("bg-[color:var(--atelier-violet)]");
    expect(html).toContain("divide-y");
    expect(text).toContain("Essai gratuit de 15 jours, sans carte bancaire.");
    for (const inclusion of PRICING_PLANS[0]!.included) {
      expect(text).toContain(inclusion);
    }
  });
});
