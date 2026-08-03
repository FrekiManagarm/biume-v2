// apps/marketing/__tests__/landing-v5-foundation.test.tsx
import { describe, expect, test } from "bun:test";

describe("landing-v5 foundation", () => {
  test("landing-v5.css defines the exact handoff tokens and keyframes", async () => {
    const css = await Bun.file(
      new URL("../components/landing-v5/landing-v5.css", import.meta.url),
    ).text();

    expect(css).toMatch(/--lv5-violet:\s*#6B5AC8;/i);
    expect(css).toMatch(/--lv5-violet-soft:\s*#EEEBFB;/i);
    expect(css).toMatch(/--lv5-violet-ink:\s*#4E3FA3;/i);
    expect(css).toMatch(/--lv5-blue:\s*#5D9BB8;/i);
    expect(css).toMatch(/--lv5-blue-soft:\s*#E8F1F5;/i);
    expect(css).toMatch(/--lv5-blue-ink:\s*#3d738c;/i);
    expect(css).toMatch(/--lv5-green:\s*#2E9866;/i);
    expect(css).toMatch(/--lv5-green-ink:\s*#21734D;/i);
    expect(css).toMatch(/--lv5-green-soft:\s*#E7F3ED;/i);
    expect(css).toMatch(/--lv5-canvas:\s*#F7F7F4;/i);
    expect(css).toMatch(/--lv5-surface:\s*#FDFDFB;/i);
    expect(css).toMatch(/--lv5-surface-muted:\s*#ECECE7;/i);
    expect(css).toMatch(/--lv5-ink:\s*#1D1D21;/i);
    expect(css).toMatch(/--lv5-ink-soft:\s*#696970;/i);
    expect(css).toMatch(/--lv5-ink-mid:\s*#4a4a52;/i);
    expect(css).toMatch(/--lv5-line:\s*#DEDED7;/i);
    expect(css).toMatch(/--lv5-anthracite:\s*#202024;/i);
    expect(css).toContain("@keyframes biume-cue");
    expect(css).toContain("@keyframes biume-pulse");
    expect(css).toContain("@keyframes biume-volet");
    expect(css).not.toContain("prefers-reduced-motion");
    expect(css).toMatch(/font-family:\s*var\(--lv5-font-sans\)/);
  });

  test("fonts.ts loads Hanken Grotesk through next/font/google", async () => {
    const fonts = await Bun.file(
      new URL("../components/landing-v5/fonts.ts", import.meta.url),
    ).text();

    expect(fonts).toContain(
      'import { Hanken_Grotesk } from "next/font/google"',
    );
    expect(fonts).toContain('variable: "--font-landing-v5-sans"');
    expect(fonts).toContain("landingV5FontVariables");
  });
});
