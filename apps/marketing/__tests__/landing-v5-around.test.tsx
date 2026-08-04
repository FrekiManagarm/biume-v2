import { describe, expect, test } from "bun:test";

import { LandingV5Around } from "../components/landing-v5/around";
import { AROUND_ITEMS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 around", () => {
  test("renders the title and all four cards", () => {
    const html = renderWithLandingImageConfig(<LandingV5Around />);
    const text = textOnly(html);

    expect(text).toContain("Autour du compte rendu, ce qui est déjà là.");
    for (const item of AROUND_ITEMS) {
      expect(text).toContain(item.title);
      expect(text).toContain(item.body);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/around.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
