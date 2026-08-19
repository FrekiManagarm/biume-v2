import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Pricing } from "../components/landing-v5/pricing";
import { DEMO_URL, PRICING_PLAN } from "../components/landing-v5/content";
import { webAppPath } from "../lib/web-app-url";
import { cleanup, fireEvent, render } from "./dom-test-utils";

afterEach(cleanup);

describe("LandingV5Pricing", () => {
  test("shows the monthly price by default and switches to annual on click", () => {
    const { container, getByRole } = render(<LandingV5Pricing />);

    expect(container.textContent).toContain(PRICING_PLAN.monthly.price);
    expect(container.textContent).not.toContain(PRICING_PLAN.annual.note);

    fireEvent.click(getByRole("button", { name: /Annuel/ }));

    expect(container.textContent).toContain(PRICING_PLAN.annual.price);
    expect(container.textContent).toContain(PRICING_PLAN.annual.note);
  });

  test("keeps the exact annual total of 299,88 euros, never 299,90", () => {
    const { container, getByRole } = render(<LandingV5Pricing />);
    fireEvent.click(getByRole("button", { name: /Annuel/ }));

    expect(container.textContent).toContain("299,88");
    expect(container.textContent).not.toContain("299,90");
  });

  test("signup CTA points to webAppPath('/signup') with the pricing-signup conversion marker", () => {
    const { getByRole } = render(<LandingV5Pricing />);
    const link = getByRole("link", { name: PRICING_PLAN.ctaLabel });

    expect(link.getAttribute("href")).toBe(webAppPath("/signup"));
    expect(link.getAttribute("data-conversion")).toBe("pricing-signup");
  });

  test("secondary card links to the demo booking URL", () => {
    const { getByRole } = render(<LandingV5Pricing />);
    const link = getByRole("link", { name: PRICING_DEMO_LABEL() });

    expect(link.getAttribute("href")).toBe(DEMO_URL);
  });
});

function PRICING_DEMO_LABEL() {
  // Importé séparément pour éviter un import inutilisé si le contenu change de forme.
  return require("../components/landing-v5/content").PRICING_DEMO_CARD.cta as string;
}
