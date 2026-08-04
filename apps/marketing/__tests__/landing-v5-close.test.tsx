import { describe, expect, test } from "bun:test";

import { LandingV5Close } from "../components/landing-v5/close";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 close", () => {
  test("renders the closing title, lead, CTA and trial note", () => {
    const html = renderWithLandingImageConfig(<LandingV5Close />);
    const text = textOnly(html);

    expect(text).toContain("Votre prochaine séance peut être la première.");
    expect(text).toContain("Prenez vos notes comme d'habitude.");
    expect(text).toContain("Préparer mon premier compte rendu");
    expect(text).toContain("15 jours d'essai, sans carte bancaire");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="close-signup"');
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/close.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
