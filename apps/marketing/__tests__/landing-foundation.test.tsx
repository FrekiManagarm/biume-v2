import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/font/google", () => ({
  Hanken_Grotesk: () => ({ variable: "font-hanken" }),
}));

const { LandingShell } = await import(
  "../components/landing/landing-shell"
);

describe("atelier precision landing foundation", () => {
  test("scopes the approved theme and font to the homepage", () => {
    const html = renderToStaticMarkup(
      <LandingShell><main>Contenu</main></LandingShell>,
    );

    expect(html).toContain("atelier-theme");
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

  test("defines semantic colors, restrained radii and reveal motion", async () => {
    const css = await Bun.file(new URL("../app/globals.css", import.meta.url)).text();

    expect(css).toMatch(/--atelier-violet:\s*#6b5ac8;/i);
    expect(css).toMatch(/--atelier-blue:\s*#5d9bb8;/i);
    expect(css).toMatch(/--atelier-green:\s*#2e9866;/i);
    expect(css).toMatch(/--atelier-surface-radius:\s*1rem;/);
    expect(css).toMatch(/--atelier-media-radius:\s*1\.5rem;/);
    expect(css).toMatch(/\.atelier-reveal\s*{[^}]*animation:/s);
    expect(css).toMatch(/@keyframes atelier-reveal[\s\S]*opacity:\s*0\.[1-9]/);
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");
  });

  test("loads Hanken Grotesk only from the homepage shell", async () => {
    const [shell, layout] = await Promise.all([
      Bun.file(
        new URL("../components/landing/landing-shell.tsx", import.meta.url),
      ).text(),
      Bun.file(new URL("../app/layout.tsx", import.meta.url)).text(),
    ]);

    expect(shell).toContain(
      'import { Hanken_Grotesk } from "next/font/google"',
    );
    expect(shell).toContain('variable: "--font-hanken"');
    expect(shell).toContain("hanken.variable");
    expect(layout).not.toContain("Hanken_Grotesk");
    expect(layout).not.toContain("--font-hanken");
    expect(layout).toMatch(/<html[\s\S]*className="antialiased"/);
  });
});
