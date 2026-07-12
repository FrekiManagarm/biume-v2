import { describe, expect, mock, test } from "bun:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
}));

const { default: HomePage } = await import("../app/page");
const clientGraphFixtureRoot = new URL(
  "./fixtures/homepage-client-graph/",
  import.meta.url,
);

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

function landingSectionTag(html: string, id: string) {
  return html.match(
    new RegExp(`<section\\b[^>]*data-landing-section="${id}"[^>]*>`),
  )?.[0];
}

async function homepageClientIslands(
  entryUrl = new URL("../app/page.tsx", import.meta.url),
  moduleRoot = new URL("../", import.meta.url),
) {
  const rootPath = fileURLToPath(moduleRoot);
  const configPath = fileURLToPath(new URL("tsconfig.json", moduleRoot));
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  }
  const { options } = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  const pending = [fileURLToPath(entryUrl)];
  const visited = new Set<string>();
  const clients: string[] = [];

  while (pending.length > 0) {
    const modulePath = pending.pop()!;

    if (visited.has(modulePath)) continue;
    visited.add(modulePath);

    const source = await Bun.file(modulePath).text();
    const sourceFile = ts.createSourceFile(
      modulePath,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    const firstStatement = sourceFile.statements[0];
    if (
      firstStatement &&
      ts.isExpressionStatement(firstStatement) &&
      ts.isStringLiteral(firstStatement.expression) &&
      firstStatement.expression.text === "use client"
    ) {
      clients.push(path.relative(rootPath, modulePath));
    }

    const runtimeSpecifiers: string[] = [];
    const visit = (node: ts.Node) => {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const importClause = node.importClause;
        const namedBindings = importClause?.namedBindings;
        const hasRuntimeBinding =
          !importClause ||
          (!importClause.isTypeOnly &&
            (Boolean(importClause.name) ||
              (namedBindings && ts.isNamespaceImport(namedBindings)) ||
              (namedBindings &&
                ts.isNamedImports(namedBindings) &&
                (namedBindings.elements.length === 0 ||
                  namedBindings.elements.some(
                    (element) => !element.isTypeOnly,
                  )))));

        if (hasRuntimeBinding) runtimeSpecifiers.push(node.moduleSpecifier.text);
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const exportClause = node.exportClause;
        const hasRuntimeExport =
          !node.isTypeOnly &&
          (!exportClause ||
            ts.isNamespaceExport(exportClause) ||
            exportClause.elements.length === 0 ||
            exportClause.elements.some((element) => !element.isTypeOnly));

        if (hasRuntimeExport) runtimeSpecifiers.push(node.moduleSpecifier.text);
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteralLike(node.arguments[0]!)
      ) {
        runtimeSpecifiers.push(node.arguments[0]!.text);
      }

      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    for (const specifier of runtimeSpecifiers) {
      const resolved = ts.resolveModuleName(
        specifier,
        modulePath,
        options,
        ts.sys,
      ).resolvedModule;
      if (!resolved || resolved.isExternalLibraryImport) continue;

      const dependency = path.resolve(resolved.resolvedFileName);
      const relativeDependency = path.relative(rootPath, dependency);
      const isDeclaration = /\.d\.(?:ts|mts|cts)$/i.test(dependency);
      const isLocalRuntimeModule =
        relativeDependency !== "" &&
        !relativeDependency.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativeDependency) &&
        /\.[cm]?[jt]sx?$/.test(dependency) &&
        !isDeclaration;

      if (isLocalRuntimeModule) pending.push(dependency);
    }
  }

  return clients.sort();
}

describe("Biume cinematic plan-sequence homepage", () => {
  test("assembles five ordered conversion moments", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="transformation"',
      'data-landing-section="product-proof"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ];

    expect(html).toContain("carnet-theme");
    expect(html).toContain("cinematic-theme");
    expect(html.match(/data-landing-section=/g)).toHaveLength(5);
    for (const marker of markers) {
      expect(html).toContain(marker);
    }
    for (let index = 1; index < markers.length; index += 1) {
      expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
        html.indexOf(markers[index]!),
      );
    }
  });

  test("keeps the mobile narrative inside the approved height budget", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const hero = landingSectionTag(html, "hero");

    expect(hero).toBeDefined();
    expect(hero).toBe(
      '<section data-landing-section="hero" class="cinematic-hero relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden">',
    );
    for (const id of [
      "transformation",
      "product-proof",
      "pricing",
      "faq-cta",
    ]) {
      const section = landingSectionTag(html, id);

      expect(section).toBeDefined();
      expect(section).toContain("py-10");
      expect(section).toContain("md:py-20");
    }
  });

  test("renders the approved promise, report story, proof, price and close", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    for (const label of [
      "Scène 01 · Le geste",
      "Scène 02 · La trace",
      "Scène 03 · Le document",
      "Scène 04 · Le choix",
      "Scène 05 · La suite",
    ]) {
      expect(text).toContain(label);
    }
    expect(text).toContain("Vos observations, dans des mots qui restent.");
    expect(text).toContain(
      "Une note devient un document que le propriétaire peut comprendre.",
    );
    expect(html.match(/data-report-state=/g)).toHaveLength(4);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.observation);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("PDF professionnel");
    expect(html).toContain("Relance de rendez-vous");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");
    expect(html.match(/<details/g)).toHaveLength(6);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    expect(text).toContain("La séance est terminée. Le suivi peut commencer.");
    expect(html).toContain('data-epilogue="human-followup"');
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toMatch(/style="[^"]*opacity:\s*0(?:[;\s"])/i);
    expect(html).not.toContain("visibility:hidden");
    expect(html).not.toContain('aria-hidden="true" data-report-state');
  });

  test("maps every stable conversion hook to the signup application", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const expectedCounts = {
      "header-signup": 2,
      "hero-signup": 1,
      "pricing-signup": 1,
      "final-signup": 1,
    } as const;

    for (const [id, count] of Object.entries(expectedCounts)) {
      const anchors = conversionAnchors(html, id);
      expect(anchors).toHaveLength(count);
      for (const anchor of anchors) {
        expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
      }
    }
  });

  test("keeps the homepage free of unsupported or broken claims", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = html.toLowerCase();

    for (const forbidden of [
      "timeline animal",
      "retour à j+7",
      "naya va mieux depuis la séance",
      "réponse propriétaire centralisée",
      "questionnaire automatique",
      "4.9/5",
      "hébergé en france",
      "conforme au RGPD",
      'href="/contact"',
      "bg-clip-text",
    ]) {
      expect(normalized).not.toContain(forbidden.toLowerCase());
    }
  });

  test("keeps the home schema factual and service-shaped", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");

    expect(service).toBeDefined();
    expect(service?.description).toBe(
      "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
    );
    expect(
      schemas.some((schema) => schema["@type"] === "SoftwareApplication"),
    ).toBe(false);
    expect(service?.offers).toBeUndefined();
  });

  test("limits client hydration to the three interactive islands", async () => {
    expect(await homepageClientIslands()).toEqual([
      "components/landing/cinematic-hero-media.tsx",
      "components/landing/cinematic-scene-controller.tsx",
      "components/landing/pricing-selector.tsx",
    ]);
  });

  test("discovers a client island reached through a re-export", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-re-export.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("discovers a client island reached through a dynamic import", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-dynamic-import.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("discovers a client island reached through a local alias", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-alias.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("discovers a client island reached through an empty import", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-empty-import.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("discovers a client island reached through an empty export", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-empty-export.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("discovers a client island reached through a template import", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-template-import.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual(["fourth-client.tsx"]);
  });

  test("excludes modern TypeScript declaration modules", async () => {
    expect(
      await homepageClientIslands(
        new URL("via-declarations.ts", clientGraphFixtureRoot),
        clientGraphFixtureRoot,
      ),
    ).toEqual([]);
  });

  test("keeps cinematic CSS progressively enhanced and motion-safe", async () => {
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();

    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(
      /\.cinematic-hero-media__depth[^}]*transform:\s*none\s*!important/s,
    );
    expect(css).not.toContain("scroll-snap-type");
    expect(css).not.toContain("cursor: none");
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("@keyframes landing-hero-enter");
    expect(css).not.toContain("@keyframes landing-hero-photo-enter");
  });

  test("uses stable system font stacks without delaying first paint", async () => {
    const [source, layoutSource, css] = await Promise.all([
      Bun.file(new URL("../app/page.tsx", import.meta.url)).text(),
      Bun.file(new URL("../app/layout.tsx", import.meta.url)).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
    ]);

    expect(source).not.toContain("next/font/google");
    expect(layoutSource).not.toContain("next/font/google");
    expect(css).toMatch(/--font-geist-sans:\s*ui-sans-serif/);
    expect(css).toMatch(/--font-geist-mono:\s*ui-monospace/);
    expect(css).toMatch(/--font-newsreader:[^;]*Iowan Old Style/s);
  });

  test("scopes Tailwind discovery to each owning application", async () => {
    const [sharedCss, marketingCss, webCss] = await Promise.all([
      Bun.file(
        new URL(
          "../../../packages/ui/src/styles/globals.css",
          import.meta.url,
        ),
      ).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
      Bun.file(new URL("../../web/src/styles.css", import.meta.url)).text(),
    ]);

    expect(sharedCss).toContain('@import "tailwindcss" source(none)');
    expect(sharedCss).not.toContain('@source "../../../apps/**/*.{ts,tsx}"');
    expect(sharedCss).not.toContain('@source "../**/*.{ts,tsx}"');
    expect(marketingCss).toContain('@source "../**/*.{ts,tsx,mdx}"');
    expect(marketingCss).toContain(
      '@source "../../../packages/ui/src/components/{button,dropdown-menu,tooltip}.tsx"',
    );
    expect(webCss).toContain('@source "./**/*.{ts,tsx}"');
    expect(webCss).toContain(
      '@source "../../../packages/ui/src/**/*.{ts,tsx}"',
    );
  });

  test("inlines the route CSS on the critical render path", async () => {
    const config = await Bun.file(
      new URL("../next.config.ts", import.meta.url),
    ).text();

    expect(config).toContain("inlineCss: true");
  });
});
