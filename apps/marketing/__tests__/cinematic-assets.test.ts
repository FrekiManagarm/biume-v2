import { describe, expect, test } from "bun:test";

describe("cinematic landing assets", () => {
  test("keeps the mobile hero as a small WebP source", async () => {
    const asset = Bun.file(
      new URL(
        "../public/assets/images/landing/hero-practitioner-horse-mobile.webp",
        import.meta.url,
      ),
    );
    const bytes = new Uint8Array(await asset.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 12));

    expect(signature.slice(0, 4)).toBe("RIFF");
    expect(signature.slice(8, 12)).toBe("WEBP");
    expect(asset.size).toBeLessThanOrEqual(24 * 1024);
  });
});
