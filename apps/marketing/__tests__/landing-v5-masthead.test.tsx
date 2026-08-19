import { describe, expect, test } from "bun:test";

import { LandingV5Masthead } from "../components/landing-v5/masthead";
import { NAV_LINKS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("LandingV5Masthead", () => {
  test("renders every nav link once, all with real hrefs", () => {
    const html = renderWithLandingImageConfig(<LandingV5Masthead />);
    for (const link of NAV_LINKS) {
      expect(html.match(new RegExp(`href="${link.href}"`, "g"))).toHaveLength(1);
      expect(textOnly(html)).toContain(link.label);
    }
  });

  test("uses a native details/summary for the mobile menu, no client state", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source).toContain("<details");
    expect(source).toContain("<summary");
    // Le composant tout entier peut être 'use client' pour le ScrollTrigger
    // du fond du masthead, mais le menu mobile lui-même ne doit dépendre
    // d'aucun useState : c'est le natif <details> qui porte l'état ouvert/fermé.
    expect(source).not.toContain("useState");
  });

  test("keeps the responsive switch in Tailwind breakpoints, not JS", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source).toMatch(/max-\[980px\]|min-\[980px\]/);
    expect(source).not.toContain("window.innerWidth");
    expect(source).not.toContain("matchMedia");
  });

  test("has an accessible mobile nav landmark distinct from the desktop one", () => {
    const html = renderWithLandingImageConfig(<LandingV5Masthead />);
    expect(html).toContain('aria-label="Navigation principale"');
    expect(html).toContain('aria-label="Navigation mobile"');
  });
});
