import { describe, expect, test } from "bun:test";

import { LandingV5Owner } from "../components/landing-v5/owner";
import { OWNER_MOCK_FOLLOWUP, OWNER_MOCK_LINK, OWNER_POINTS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 owner", () => {
  test("renders the title, the three points and both device mocks", () => {
    const html = renderWithLandingImageConfig(<LandingV5Owner />);
    const text = textOnly(html);

    expect(html).toContain('id="proprietaire"');
    expect(text).toContain("Il n'installe rien, il ne crée pas de compte.");
    for (const point of OWNER_POINTS) {
      expect(text).toContain(point);
    }
    expect(text).toContain(OWNER_MOCK_LINK.message);
    expect(text).toContain(OWNER_MOCK_FOLLOWUP.question);
    expect(text).toContain(OWNER_MOCK_FOLLOWUP.answers[OWNER_MOCK_FOLLOWUP.selectedIndex]);
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/owner.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
