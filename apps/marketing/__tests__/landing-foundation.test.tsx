import { describe, expect, test } from "bun:test";

describe("V2 component foundation", () => {
  test("keeps the V2 tokens untouched and locks the motion decisions", async () => {
    const [css, motion] = await Promise.all([
      Bun.file(new URL("../app/v2/v2.css", import.meta.url)).text(),
      Bun.file(new URL("../components/v2/reveal.tsx", import.meta.url)).text(),
    ]);

    // La feuille du namespace `.v2` sert aussi les pages SEO : elle ne
    // bouge pas.
    expect(css).toMatch(/--v2-violet-ink:\s*#6b5ac8;/i);
    expect(css).toMatch(/--v2-green:\s*hsl\(148 71% 45%\);/i);
    expect(css).toMatch(/--v2-canvas:\s*#f7f6f2;/i);
    expect(css).toMatch(/border-radius:\s*24px;/);
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");

    // `prefers-reduced-motion` est écarté sur demande explicite de
    // Mathieu, deux fois : une première sur /v4, reconduite ici après que
    // la conséquence a été signalée. Le test verrouille la décision ET sa
    // trace écrite, pour qu'une réintroduction distraite échoue.
    expect(motion).not.toContain("prefers-reduced-motion");
    expect(motion).toContain("écarté");

    // Un seul moteur d'animation dans cet arbre.
    expect(motion).not.toMatch(/from\s+["']motion\/react["']/);

    // Un seul observateur du défilement : celui de ScrollTrigger,
    // alimenté par Lenis.
    expect(motion).toContain('lenis.on("scroll", ScrollTrigger.update)');
    expect(motion).toContain("gsap.ticker.add");
    expect(motion).toContain("lagSmoothing(0)");
    expect(motion).not.toMatch(/window\.addEventListener\(\s*["']scroll/);

    // Les états de visibilité sont posés en JS, jamais en CSS : sans
    // script, aucun contenu n'est masqué et la page reste lisible, `/`
    // est indexée. Seule exception, assumée : la teinte « pas encore
    // lue » du manifeste, écartée par `landing.css`, reste lisible.
    expect(motion).toContain("gsap.set");
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
