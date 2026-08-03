import { describe, expect, test } from "bun:test";

import { LandingV5Footer } from "../components/landing-v5/footer";
import { FOOTER_COLUMNS, FOOTER_LINE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 footer", () => {
  test("renders all four columns and every link", () => {
    const html = renderWithLandingImageConfig(<LandingV5Footer />);
    const text = textOnly(html);

    expect(text).toContain("Biume");
    expect(text).toContain(FOOTER_LINE);
    for (const column of FOOTER_COLUMNS) {
      expect(text).toContain(column.title);
      for (const link of column.links) {
        expect(text).toContain(link.label);
        expect(html).toContain(`href="${link.href}"`);
      }
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/footer.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
