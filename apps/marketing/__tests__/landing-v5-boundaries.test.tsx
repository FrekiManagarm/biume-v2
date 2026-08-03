import { describe, expect, test } from "bun:test";

import { LandingV5Boundaries } from "../components/landing-v5/boundaries";
import { BOUNDARIES } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 boundaries", () => {
  test("renders the title and all five boundary lines", () => {
    const html = renderWithLandingImageConfig(<LandingV5Boundaries />);
    const text = textOnly(html);

    expect(text).toContain("Ce que Biume ne fait pas.");
    expect(html.match(/<li/g)).toHaveLength(5);
    for (const line of BOUNDARIES) {
      expect(text).toContain(line);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/boundaries.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
