import { describe, expect, test } from "bun:test";

describe("V2 landing foundation", () => {
  test("integrates the V2 composition around the homepage structure", async () => {
    const page = await Bun.file(new URL("../app/page.tsx", import.meta.url)).text();

    expect(page).toContain('import { V2Landing } from "../components/v2/v2-landing"');
    expect(page).toMatch(/<JsonLd[\s\S]*<V2Landing/);
    expect(page).not.toContain("carnet-theme");
  });

  test("defines V2 semantic colors, restrained radii and reduced motion", async () => {
    const [css, motion] = await Promise.all([
      Bun.file(new URL("../app/v2/v2.css", import.meta.url)).text(),
      Bun.file(new URL("../components/v2/reveal.tsx", import.meta.url)).text(),
    ]);

    expect(css).toMatch(/--v2-violet-ink:\s*#6b5ac8;/i);
    expect(css).toMatch(/--v2-green:\s*hsl\(148 71% 45%\);/i);
    expect(css).toMatch(/--v2-canvas:\s*#f7f6f2;/i);
    expect(css).toMatch(/border-radius:\s*24px;/);
    expect(motion).toContain('reducedMotion="user"');
    expect(motion).toContain("useReducedMotion");
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");
  });

  test("loads the V2 fonts through its dedicated landing component", async () => {
    const [fonts, layout] = await Promise.all([
      Bun.file(new URL("../components/v2/fonts.ts", import.meta.url)).text(),
      Bun.file(new URL("../app/layout.tsx", import.meta.url)).text(),
    ]);

    expect(fonts).toContain('import { Geist, Geist_Mono } from "next/font/google"');
    expect(fonts).toContain('variable: "--font-v2-sans"');
    expect(fonts).toContain('variable: "--font-v2-mono"');
    expect(layout).not.toContain("Hanken_Grotesk");
    expect(layout).toMatch(/<html[\s\S]*className="antialiased"/);
  });
});
