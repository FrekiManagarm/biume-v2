import { describe, expect, test } from "bun:test";

import OpenGraphImage, {
  alt,
  brandLogoSrc,
  brandSubtitle,
  contentType,
  headline,
  headlineStyle,
  size,
} from "../app/opengraph-image";

describe("generated Open Graph image", () => {
  test("uses the social preview dimensions expected by Next metadata", () => {
    expect(alt).toBe("Biume - logiciel de compte rendu pour ostéopathe animalier");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  test("keeps the preview minimal and anchored to the Biume brand", () => {
    expect(brandLogoSrc.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(brandLogoSrc).toContain("biume-gradient");
    expect(brandSubtitle).toBe("");
    expect(headline).toBe("Chaque séance mérite une suite.");
    expect(headlineStyle.fontSize).toBeLessThanOrEqual(72);
  });

  test("renders a PNG response", async () => {
    const response = OpenGraphImage();

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });
});
