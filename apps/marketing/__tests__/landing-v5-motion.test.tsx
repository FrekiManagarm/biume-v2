import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Reveal } from "../components/landing-v5/motion";

describe("landing-v5 motion", () => {
  test("Reveal renders a data-reveal node with the given delay", () => {
    const html = renderToStaticMarkup(
      <Reveal delay={180} className="test-class">
        <p>hello</p>
      </Reveal>,
    );

    expect(html).toContain('data-reveal=""');
    expect(html).toContain('data-delay="180"');
    expect(html).toContain("test-class");
  });

  test("Reveal defaults delay to 0", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>hello</p>
      </Reveal>,
    );

    expect(html).toContain('data-delay="0"');
  });

  test("keeps a single motion engine, no reduced-motion guard, no raw scroll listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/motion.tsx", import.meta.url),
    ).text();

    expect(source).toContain('"use client"');
    expect(source).not.toMatch(/from\s+["']motion\/react["']/);
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
    expect(source).toContain('lenis.on("scroll", ScrollTrigger.update)');
    expect(source).toContain("gsap.ticker.add");
    expect(source).toContain("lagSmoothing(0)");
    expect(source).toContain("ScrollTrigger.batch");
    expect(source).toContain("export function LandingV5MotionRoot");
    expect(source).toContain("export function Parallax");
    expect(source).toContain("export function ensureGsapPlugins");
    expect(source).toContain("export const EASE");
  });
});
