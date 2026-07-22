import { describe, expect, test } from "bun:test";

import V3Page, { metadata } from "../app/v3/page";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("V3 Clinical Studio landing", () => {
  test("keeps the route private to experiments", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toContain("Biume");
  });

  test("keeps the approved practitioner workflow and conversion links", () => {
    const html = renderWithLandingImageConfig(<V3Page />);
    const content = textOnly(html);

    expect(content).toContain("Vos notes gardent votre regard.");
    expect(content).toContain("Vous relisez, adaptez et validez");
    expect(content).toContain("ostéopathes animaliers indépendants");
    expect(html).toContain('href="/signup"');
    expect(html).toContain('href="/signin"');
    expect(html).toContain('data-conversion="v3-hero-signup"');
    expect(html).toContain('data-conversion="v3-pricing-signup"');
    expect(html).not.toContain("diagnostic");
    expect(html).not.toContain("guéri");
  });
});
