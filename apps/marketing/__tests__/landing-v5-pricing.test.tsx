import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Pricing } from "../components/landing-v5/pricing";
import { PRICING_PLAN } from "../components/landing-v5/content";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 pricing", () => {
  test("renders the monthly price by default with all five inclusions", () => {
    const html = renderWithLandingImageConfig(<LandingV5Pricing />);
    const text = textOnly(html);

    expect(html).toContain('id="tarifs"');
    expect(text).toContain(PRICING_PLAN.monthly.price);
    expect(text).toContain(PRICING_PLAN.monthly.note);
    for (const item of PRICING_PLAN.included) {
      expect(text).toContain(item);
    }
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="pricing-signup"');
    expect(html).toContain('data-conversion="pricing-demo"');
  });

  test("switches to the annual price and note on click, updating aria-pressed", () => {
    const { container } = render(<LandingV5Pricing />);
    const pricing = within(container);
    const priceBlock = container.querySelector('[data-billing-price]');

    expect(priceBlock?.textContent).toContain(PRICING_PLAN.monthly.price);

    fireEvent.click(pricing.getByRole("button", { name: "Annuel" }));

    expect(priceBlock?.textContent).toContain(PRICING_PLAN.annual.price);
    expect(priceBlock?.textContent).toContain(PRICING_PLAN.annual.note);
    expect(pricing.getByRole("button", { name: "Annuel" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(pricing.getByRole("button", { name: "Mensuel" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  test("keeps the billing toggle accessible", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/pricing.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("data-billing-selector");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("min-h-11");
    expect(source).toContain("prefetch={false}");
  });
});
