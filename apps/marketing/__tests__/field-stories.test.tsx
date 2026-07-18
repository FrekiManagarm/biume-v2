import { describe, expect, test } from "bun:test";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { FieldStories } from "../components/landing/field-stories";

describe("field stories", () => {
  test("returns the product story to real practice without invented proof", () => {
    const html = renderWithLandingImageConfig(<FieldStories />);
    const text = textOnly(html).toLowerCase();
    expect(text).toContain("conçu autour du terrain, pas autour d’un écran");
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("atelier-owner.webp");
    expect(html.match(/data-field-image=/g)).toHaveLength(2);
    expect(text).not.toContain("témoignage");
    expect(text).not.toMatch(/\b\d+(?:[,.]\d+)?\s*%\b/);
  });
});
