import { afterEach, describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PricingManifest,
  PRICING_PLANS,
  type PricingPlan,
} from "../components/landing/pricing-manifest";
import { webAppPath } from "../lib/web-app-url";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";
import { conversionAnchors, textOnly } from "./landing-test-utils";

afterEach(cleanup);

describe("pricing manifest", () => {
  test("renders one transparent offer without a plan selector", () => {
    const html = renderToStaticMarkup(<PricingManifest />);
    const text = textOnly(html);

    expect(PRICING_PLANS).toHaveLength(1);
    expect(text).toContain("Tout le parcours. Un seul abonnement.");
    expect(text).toContain("24,99 €");
    expect(text).toContain("299,88 € facturés une fois par an");
    expect(text).toContain("29,99 €");
    expect(text).toContain("L’abonnement peut être arrêté depuis les paramètres.");
    expect(html).not.toContain("data-plan-selector");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    expect(conversionAnchors(html, "pricing-signup")[0]).toContain(
      `href="${webAppPath("/signup")}"`,
    );
    expect(PRICING_PLANS[0]!.cta).toEqual({
      href: webAppPath("/signup"),
      label: "Essayer gratuitement",
    });
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
    expect(controlsSource).toContain("prefetch={false}");
    expect(manifestSource).not.toContain('"use client"');
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

  test("switches real billing and plan controls with live price and CTA updates", () => {
    const collective: PricingPlan = {
      ...PRICING_PLANS[0]!,
      id: "collective",
      name: "Collectif",
      headline: "Le parcours de votre collectif.",
      included: ["Espace collectif"],
      prices: {
        annual: {
          label: "Annuel",
          displayPrice: "49,99 €",
          suffix: "par mois, facturé annuellement",
          detail: "599,88 € facturés une fois par an",
        },
        monthly: {
          label: "Mensuel",
          displayPrice: "59,99 €",
          suffix: "par mois",
          detail: "Facturation mensuelle",
        },
      },
      cta: {
        href: "/collectif",
        label: "Choisir Collectif",
      },
    };
    const { container } = render(
      <PricingManifest plans={[PRICING_PLANS[0]!, collective]} />,
    );
    const pricing = within(container);
    const livePrice = container.querySelector<HTMLElement>(
      '[data-billing-price][aria-live="polite"]',
    );

    expect(livePrice).not.toBeNull();
    expect(livePrice?.textContent).toContain("24,99 €");
    expect(
      pricing
        .getByRole("link", { name: "Essayer gratuitement" })
        .getAttribute("href"),
    ).toBe(webAppPath("/signup"));

    fireEvent.click(pricing.getByRole("button", { name: /Mensuel/ }));
    expect(livePrice?.textContent).toContain("29,99 €");
    expect(livePrice?.textContent).toContain(
      "Facturation mensuelle, résiliable en fin de période",
    );

    fireEvent.click(pricing.getByRole("button", { name: "Collectif" }));
    expect(pricing.getByText("Le parcours de votre collectif.")).not.toBeNull();
    expect(livePrice?.textContent).toContain("59,99 €");
    expect(pricing.getByText("Espace collectif")).not.toBeNull();
    expect(
      pricing
        .getByRole("link", { name: "Choisir Collectif" })
        .getAttribute("href"),
    ).toBe("/collectif");

    fireEvent.click(pricing.getByRole("button", { name: /Annuel/ }));
    expect(livePrice?.textContent).toContain("49,99 €");
    expect(livePrice?.textContent).toContain(
      "599,88 € facturés une fois par an",
    );
  });
});
