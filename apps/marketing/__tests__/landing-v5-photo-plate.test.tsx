import { describe, expect, test } from "bun:test";

import { PhotoPlate } from "../components/landing-v5/photo-plate";
import { PRACTICE_PLATE, OWNER_PLATE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 photo plate", () => {
  test("renders the dark-tone practice plate with light-tone text", () => {
    const html = renderWithLandingImageConfig(
      <PhotoPlate
        ariaLabel="Le geste"
        tone="dark"
        heightClass="min-h-[min(74svh,620px)]"
        {...PRACTICE_PLATE}
      />,
    );
    const text = textOnly(html);

    expect(html).toContain('aria-label="Le geste"');
    expect(text).toContain("Ce que vos notes racontent");
    expect(text).toContain("Vingt minutes de gestes tiennent en huit lignes d'abréviations.");
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("rgba(32,32,36,.78)");
  });

  test("renders the light-tone owner plate", () => {
    const html = renderWithLandingImageConfig(
      <PhotoPlate
        ariaLabel="Le propriétaire"
        tone="light"
        heightClass="min-h-[min(70svh,580px)]"
        {...OWNER_PLATE}
      />,
    );
    const text = textOnly(html);

    expect(html).toContain('aria-label="Le propriétaire"');
    expect(text).toContain("Ce que le propriétaire retient");
    expect(html).toContain("atelier-owner.webp");
    expect(html).toContain("rgba(247,247,244,.92)");
  });
});
