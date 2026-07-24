import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test } from "bun:test";

import { webAppPath } from "../lib/web-app-url";
import { act, cleanup, fireEvent, render, within } from "./dom-test-utils";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

const marketingRoot = join(import.meta.dir, "..");
const dependencySections = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;
const ignoredSourcePathPrefixes = ["__tests__/", "node_modules/", ".next/"];
const heroUIStylesReference = /@heroui\/styles(?:\/[^\s"'();]*)?/;

type DependencySection = (typeof dependencySections)[number];
type PackageJson = Partial<Record<DependencySection, Record<string, string>>>;

function hasHeroUIStylesReference(source: string) {
  return heroUIStylesReference.test(source);
}

test("detects prohibited HeroUI styles references", () => {
  expect(hasHeroUIStylesReference('import "@heroui/styles/foo";')).toBe(true);
  expect(hasHeroUIStylesReference("import '@heroui/styles/foo';")).toBe(true);
  expect(hasHeroUIStylesReference('@import url("@heroui/styles");')).toBe(true);
  expect(hasHeroUIStylesReference("@import url('@heroui/styles/foo');")).toBe(
    true,
  );
});

test("V4 Product Lab has the HeroUI foundation", async () => {
  const packageJson = JSON.parse(
    readFileSync(join(marketingRoot, "package.json"), "utf8"),
  ) as PackageJson;
  const globalsCss = readFileSync(join(marketingRoot, "app/globals.css"), "utf8");
  const v4CssPath = join(marketingRoot, "app/v4/v4.css");
  const v4Css = existsSync(v4CssPath) ? readFileSync(v4CssPath, "utf8") : "";
  const modalPortalTokens =
    v4Css.match(/\.v4-console-modal-backdrop\s*\{[^}]*\}/)?.[0] ?? "";
  const sourceFiles: string[] = [];

  for await (const sourceFile of new Bun.Glob("**/*.{css,ts,tsx}").scan({
    cwd: marketingRoot,
  })) {
    if (
      !ignoredSourcePathPrefixes.some((prefix) => sourceFile.startsWith(prefix))
    ) {
      sourceFiles.push(sourceFile);
    }
  }

  const sourceFilesReferencingHeroUIStyles = sourceFiles.filter((sourceFile) =>
    hasHeroUIStylesReference(
      readFileSync(join(marketingRoot, sourceFile), "utf8"),
    ),
  );
  const prohibitedDirectDependencies = dependencySections.flatMap((section) =>
    ["framer-motion"]
      .filter((dependency) => packageJson[section]?.[dependency] !== undefined)
      .map((dependency) => `${section}.${dependency}`),
  );

  expect(packageJson.dependencies?.["@heroui/react"]).toBe("^3.2.2");
  expect(packageJson.dependencies?.["@heroui/styles"]).toBe("^3.2.2");
  expect(prohibitedDirectDependencies).toEqual([]);
  expect(globalsCss).not.toContain('@import "@heroui/styles";');
  expect(v4Css).toContain('@import "@heroui/styles";');
  expect(existsSync(v4CssPath)).toBeTrue();
  expect(v4Css).toContain("--background: #f8f8fb;");
  expect(v4Css).toContain("--accent: #6b5ac8;");
  expect(v4Css).toContain("--success: #2e9866;");
  expect(v4Css).toContain("@theme inline");
  expect(modalPortalTokens).toContain("--accent: #6b5ac8;");
  expect(modalPortalTokens).toContain("--success: #2e9866;");
  expect(modalPortalTokens).toContain("--v4-ink: var(--foreground);");
  expect(sourceFilesReferencingHeroUIStyles).toEqual(["app/v4/v4.css"]);
});

const { default: V4Page, metadata } = await import("../app/v4/page");
const { V4Landing } = await import("../components/v4/v4-landing");
const { V4SessionConsole } = await import(
  "../components/v4/v4-session-console"
);

afterEach(cleanup);

test("V4 Product Lab exposes the private practitioner landing shell", () => {
  const html = renderWithLandingImageConfig(<V4Page />);
  const content = textOnly(html);

  expect(metadata.robots).toEqual({ index: false, follow: false });
  expect(metadata.title).toBe("Biume — Préparez, relisez, décidez");
  expect(metadata.description).toBe(
    "Biume aide les ostéopathes animaliers à préparer, relire et décider de leurs comptes rendus de séance avant de les partager.",
  );
  expect(content).toContain(
    "De vos notes au propriétaire, sans perdre votre regard métier.",
  );
  expect(content).toContain("Préparez. Relisez. Décidez.");
  expect(content).toContain("15 jours gratuits, sans carte bancaire.");
  expect(html).toContain('data-v4-section="hero"');
  expect(html).toContain('data-v4-section="pricing"');
  expect(html).toContain(`href="${webAppPath("/signin")}"`);
  expect(html).toContain(`href="${webAppPath("/signup")}"`);
  expect(html).toContain('data-conversion="v4-hero-signup"');
  expect(html).toContain('data-conversion="v4-pricing-signup"');
  expect(content).toContain("24,99 € / mois");
  expect(content).not.toContain("diagnostic");
  expect(content).not.toContain("guéri");
});

test("moves through the three review stages with keyboard-accessible tabs", async () => {
  const { container } = render(<V4SessionConsole />);
  const consoleUi = within(container);

  const notes = consoleUi.getByRole("tab", { name: "Notes" });
  const relecture = consoleUi.getByRole("tab", { name: "Relecture" });
  expect(consoleUi.getByRole("tab", { name: "Suivi" })).not.toBeNull();
  expect(notes.getAttribute("aria-selected")).toBe("true");

  await act(async () => {
    fireEvent.click(relecture);
    await Promise.resolve();
  });

  expect(relecture.getAttribute("aria-selected")).toBe("true");
  expect(
    consoleUi.getByText("La version propriétaire attend votre accord."),
  ).not.toBeNull();

  await act(async () => {
    fireEvent.click(notes);
    await Promise.resolve();
  });

  expect(notes.getAttribute("aria-selected")).toBe("true");
  expect(consoleUi.getByText("Votre observation reste intacte.")).not.toBeNull();
});

test("opens and dismisses the read-only owner report preview", async () => {
  const { container } = render(<V4SessionConsole />);
  const consoleUi = within(container);

  await act(async () => {
    fireEvent.click(
      consoleUi.getByRole("button", { name: "Prévisualiser le compte rendu" }),
    );
    await Promise.resolve();
  });

  const dialog = within(document.body).getByRole("dialog");
  expect(dialog).not.toBeNull();
  expect(
    within(dialog).getByText("Compte rendu propriétaire — Luma"),
  ).not.toBeNull();
  const closeTrigger = within(dialog)
    .getAllByRole("button", { name: "Fermer l’aperçu" })
    .find((button) => button.classList.contains("v4-console-modal-close"));
  expect(closeTrigger).not.toBeUndefined();

  await act(async () => {
    fireEvent.keyDown(dialog, { code: "Escape", key: "Escape" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(within(document.body).queryByRole("dialog")).toBeNull();
});

test("keeps the proof grid, plan inclusions and HeroUI FAQ in the rendered page", () => {
  const html = renderWithLandingImageConfig(<V4Page />);
  const content = textOnly(html);

  expect(content).toContain("Votre note reste la source. Le reste devient partageable.");
  expect(content).toContain("Biume propose. Vous validez chaque passage.");
  expect(content).toContain("Suivi et rappel après séance");
  expect(content).toContain("Questions fréquentes");
  expect(content).toContain(
    "Est-ce que Biume envoie le compte rendu à ma place ?",
  );
});

test("uses HeroUI Card slots as the landing page's primary surface grammar", () => {
  const html = renderWithLandingImageConfig(<V4Page />);

  expect(html.match(/data-slot="card"/g)?.length).toBeGreaterThanOrEqual(10);
  expect(html).toContain('data-slot="card-header"');
  expect(html).toContain('data-slot="card-content"');
  expect(html).toContain('data-slot="card-footer"');
});

test("opens a V4 FAQ answer from its accessible HeroUI trigger", async () => {
  const { container } = render(<V4Landing />);
  const faq = within(container).getByRole("region", {
    name: "Questions fréquentes",
  });
  const trigger = within(faq).getByRole("button", {
    name: "Est-ce que Biume envoie le compte rendu à ma place ?",
  });

  expect(trigger.getAttribute("aria-expanded")).toBe("false");

  await act(async () => {
    fireEvent.click(trigger);
    await Promise.resolve();
  });

  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(
    within(faq).getByText(
      "Non. Biume prépare une base et vous choisissez si, quand et dans quelle version le compte rendu est partagé.",
    ),
  ).not.toBeNull();
});

test("keeps the V4 HeroUI light atelier visual contract", async () => {
  const v4Css = await Bun.file(
    new URL("../app/v4/v4.css", import.meta.url),
  ).text();
  const modalPortalTokens =
    v4Css.match(/\.v4-console-modal-backdrop\s*\{[^}]*\}/)?.[0] ?? "";

  expect(v4Css).toContain("--background: #f8f8fb;");
  expect(v4Css).toContain("--foreground: #17151f;");
  expect(v4Css).toContain("--surface: #ffffff;");
  expect(v4Css).toContain("--accent: #6b5ac8;");
  expect(v4Css).toContain("--success: #2e9866;");
  expect(v4Css).toContain("--v4-violet: var(--accent);");
  expect(v4Css).toContain("--v4-green: var(--success);");
  expect(v4Css).toContain(".v4-hero-image");
  expect(v4Css).toContain(".v4-journey-grid");
  expect(v4Css).toContain("@keyframes v4-console-float");
  expect(v4Css).toContain("@keyframes v4-image-breathe");
  expect(v4Css).toContain("@supports (animation-timeline: view())");
  expect(v4Css).toContain("@media (max-width: 767px)");
  expect(modalPortalTokens).toContain("--accent: #6b5ac8;");
  expect(modalPortalTokens).toContain("--success: #2e9866;");
  expect(v4Css).toContain('@import "@heroui/styles";');
  expect(v4Css).not.toContain("--v4-glass");
});

test("keeps the V4 console tabs horizontally reachable on narrow screens", async () => {
  const v4Css = await Bun.file(
    new URL("../app/v4/v4.css", import.meta.url),
  ).text();
  const tabListContainer =
    v4Css.match(/\.v4-console-tabs-list-container\s*\{[^}]*\}/)?.[0] ??
    "";
  const tabList =
    v4Css.match(/\.v4-console-tabs-list\s*\{[^}]*\}/)?.[0] ?? "";
  const scrollSurface =
    v4Css.match(
      /\.v4-console-tabs-list-container\s*>\s*\[data-slot="scroll-shadow"\]\s*\{[^}]*\}/,
    )?.[0] ?? "";

  expect(tabListContainer).not.toContain("overflow-x: auto;");
  expect(scrollSurface).toContain("overflow-x: auto;");
  expect(tabList).toContain("white-space: nowrap;");
});

test("keeps V4 distinct from the Visitors-first V3 grammar", async () => {
  const [v4Source, v4Css] = await Promise.all([
    Bun.file(
      new URL("../components/v4/v4-landing.tsx", import.meta.url),
    ).text(),
    Bun.file(new URL("../app/v4/v4.css", import.meta.url)).text(),
  ]);

  expect(v4Source).toContain("Accordion");
  expect(v4Source).toContain("V4SessionConsole");
  expect(v4Source).toContain("next/image");
  expect(v4Css).toContain("--accent: #6b5ac8;");
  expect(v4Css).toContain("--success: #2e9866;");
  expect(v4Css).toContain(
    "grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr)",
  );
  expect(v4Css).not.toContain("--v3-lavender");
  expect(v4Css).not.toContain("v3-product-band");
});
