import { describe, expect, test } from "bun:test";

describe("cinematic hero media", () => {
  test("loads the small Motion feature bundle and honors reduced motion", async () => {
    const source = await Bun.file(
      new URL("../components/landing/cinematic-hero-media.tsx", import.meta.url),
    ).text();

    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("LazyMotion");
    expect(source).toContain("domAnimation");
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("useScroll");
    expect(source).toContain("useTransform");
    expect(source).not.toContain("domMax");
    expect(source).not.toContain("AnimatePresence");
    expect(source).not.toContain("repeat: Infinity");
    expect(source).not.toMatch(/filter:|blur\(|boxShadow:/);
  });

  test("declares the mobile image quality in the Next image config", async () => {
    const config = await Bun.file(
      new URL("../next.config.ts", import.meta.url),
    ).text();

    expect(config).toContain("qualities: [48, 55, 65, 75]");
  });
});
