import { describe, expect, test } from "bun:test";

import { LandingV5Surfaces } from "../components/landing-v5/surfaces";
import { SURFACES_MOBILE, SURFACES_WEB } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 surfaces", () => {
  test("renders both cards with their chips, mocks and perimeter lists", () => {
    const html = renderWithLandingImageConfig(<LandingV5Surfaces />);
    const text = textOnly(html);

    expect(text).toContain("Le terrain dans la poche, l'atelier au bureau.");
    expect(text).toContain(SURFACES_MOBILE.chip);
    expect(text).toContain(SURFACES_WEB.chip);
    for (const card of SURFACES_MOBILE.cards) {
      expect(text).toContain(card.label);
    }
    for (const point of [...SURFACES_MOBILE.points, ...SURFACES_WEB.points]) {
      expect(text).toContain(point);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/surfaces.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
