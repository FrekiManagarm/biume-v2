import { describe, expect, test } from "bun:test";

describe("cinematic scene controller", () => {
  test("uses one observer and never installs a raw scroll listener", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/cinematic-scene-controller.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("IntersectionObserver");
    expect(source).toContain('[data-landing-section]');
    expect(source).toContain("data-cinematic-scene");
    expect(source).toContain("observer.disconnect()");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain('from "motion/react"');
    expect(source).not.toContain("repeat: Infinity");
  });
});
