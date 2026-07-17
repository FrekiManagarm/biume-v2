import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LandingShell } from "../components/landing/landing-shell";

describe("soft machine landing foundation", () => {
  test("scopes the approved theme and font to the homepage", () => {
    const html = renderToStaticMarkup(
      <LandingShell><main>Contenu</main></LandingShell>,
    );

    expect(html).toContain("soft-machine-theme");
    expect(html).toContain("font-[family-name:var(--font-hanken)]");
    expect(html).toContain("Contenu");
  });

  test("integrates the shell around the homepage structure", async () => {
    const page = await Bun.file(new URL("../app/page.tsx", import.meta.url)).text();

    expect(page).toContain(
      'import { LandingShell } from "../components/landing/landing-shell"',
    );
    expect(page).toMatch(/<LandingShell>[\s\S]*<JsonLd[\s\S]*<LandingFooter[\s\S]*<\/LandingShell>/);
    expect(page).not.toContain("carnet-theme");
  });

  test("defines semantic colors, restrained radii and reduced motion", async () => {
    const css = await Bun.file(new URL("../app/globals.css", import.meta.url)).text();

    expect(css).toMatch(/--machine-violet:\s*#6b5ac8;/i);
    expect(css).toMatch(/--machine-blue:\s*#5d9bb8;/i);
    expect(css).toMatch(/--machine-green:\s*#2e9866;/i);
    expect(css).toMatch(/--machine-surface-radius:\s*1rem;/);
    expect(css).toMatch(/--machine-media-radius:\s*1\.5rem;/);
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");
  });

  test("loads Hanken Grotesk through next font", async () => {
    const layout = await Bun.file(new URL("../app/layout.tsx", import.meta.url)).text();

    expect(layout).toContain('import { Hanken_Grotesk } from "next/font/google"');
    expect(layout).toContain('variable: "--font-hanken"');
  });
});
