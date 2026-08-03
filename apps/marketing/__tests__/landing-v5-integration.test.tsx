import { describe, expect, mock, test } from "bun:test";

mock.module("next/font/google", () => ({
  Hanken_Grotesk: () => ({ variable: "font-landing-v5-sans" }),
}));

const { LandingV5 } = await import("../components/landing-v5");
const { renderWithLandingImageConfig } = await import("./landing-test-utils");

describe("landing-v5 integration", () => {
  test("mounts every section in the parcours order with a single h1", () => {
    const html = renderWithLandingImageConfig(<LandingV5 />);

    expect(html).toContain('<main id="contenu" tabindex="-1"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);

    const order = [
      'id="hero-title"',
      'id="constat-title"',
      'id="produit"',
      'aria-label="Le geste"',
      'id="controle"',
      'aria-label="Le propriétaire"',
      'id="suivi"',
      'id="proprietaire"',
      'id="surfaces-title"',
      'id="around-title"',
      'id="limites-title"',
      'id="tarifs"',
      'id="questions"',
      'id="cloture-title"',
    ];
    const positions = order.map((marker) => html.indexOf(marker));

    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0);
    }
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("app/page.tsx mounts LandingV5 with Service and FAQPage JSON-LD", async () => {
    const page = await Bun.file(new URL("../app/page.tsx", import.meta.url)).text();

    expect(page).toContain('import { LandingV5 } from "../components/landing-v5"');
    expect(page).not.toContain("V2Landing");
    expect(page).toContain("faqJsonLd(FAQ)");
    expect(page).toMatch(/<JsonLd[\s\S]*<JsonLd[\s\S]*<LandingV5/);
  });
});
