import { describe, expect, test } from "bun:test";

import { LandingV5Facts } from "../components/landing-v5/facts";
import { FACTS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 facts", () => {
  test("renders the title and all three numbered facts", () => {
    const html = renderWithLandingImageConfig(<LandingV5Facts />);
    const text = textOnly(html);

    expect(text).toContain("La séance finit dans la voiture.");
    for (const fact of FACTS) {
      expect(text).toContain(fact.n);
      expect(text).toContain(fact.title);
      expect(text).toContain(fact.body);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/facts.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
