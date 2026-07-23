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
    ["@heroui/styles", "framer-motion"]
      .filter((dependency) => packageJson[section]?.[dependency] !== undefined)
      .map((dependency) => `${section}.${dependency}`),
  );

  expect(packageJson.dependencies?.["@heroui/react"]).toBe("^3.2.2");
  expect(prohibitedDirectDependencies).toEqual([]);
  expect(globalsCss).not.toContain('@import "@heroui/styles";');
  expect(v4Css).not.toContain('@import "@heroui/styles";');
  expect(existsSync(v4CssPath)).toBeTrue();
  expect(v4Css).toContain("--v4-glass: rgb(14 25 43 / 72%);");
  expect(v4Css).toContain("--v4-accent-soft: rgb(89 214 160 / 16%);");
  expect(modalPortalTokens).toContain("--v4-glass: rgb(14 25 43 / 72%);");
  expect(modalPortalTokens).toContain("--v4-ink: #f3f8f6;");
  expect(modalPortalTokens).toContain("--v4-muted: #aab8c9;");
  expect(modalPortalTokens).toContain("--v4-line: rgb(206 228 255 / 20%);");
  expect(modalPortalTokens).toContain("--v4-accent: #59d6a0;");
  expect(sourceFilesReferencingHeroUIStyles).toEqual([]);
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
  expect(content).toContain("Vos notes restent le point de départ.");
  expect(content).toContain("Préparez. Relisez. Décidez.");
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

  const preparation = consoleUi.getByRole("tab", { name: "Préparation" });
  const consultation = consoleUi.getByRole("tab", { name: "Consultation" });
  expect(
    consoleUi.getByRole("tab", { name: "Compte rendu" }),
  ).not.toBeNull();
  expect(preparation.getAttribute("aria-selected")).toBe("true");

  await act(async () => {
    fireEvent.click(consultation);
    await Promise.resolve();
  });

  expect(consultation.getAttribute("aria-selected")).toBe("true");
  expect(consoleUi.getByText("Votre observation, sans détour.")).not.toBeNull();

  await act(async () => {
    fireEvent.click(preparation);
    await Promise.resolve();
  });

  expect(preparation.getAttribute("aria-selected")).toBe("true");
  expect(
    consoleUi.getByText("Une version claire attend votre relecture."),
  ).not.toBeNull();
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

  expect(content).toContain("Votre note reste la source.");
  expect(content).toContain("Rien ne part sans votre décision.");
  expect(content).toContain("Suivi et rappel après séance");
  expect(content).toContain("Questions fréquentes");
  expect(content).toContain(
    "Est-ce que Biume envoie le compte rendu à ma place ?",
  );
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

test("keeps the V4 dark product-glass visual contract", async () => {
  const v4Css = await Bun.file(
    new URL("../app/v4/v4.css", import.meta.url),
  ).text();
  const modalPortalTokens =
    v4Css.match(/\.v4-console-modal-backdrop\s*\{[^}]*\}/)?.[0] ?? "";

  expect(v4Css).toContain("--v4-canvas: #070b14;");
  expect(v4Css).toContain("--v4-glass: rgb(14 25 43 / 72%);");
  expect(v4Css).toContain("--v4-glass-strong: rgb(11 21 37 / 88%);");
  expect(v4Css).toContain("--v4-accent: #59d6a0;");
  expect(v4Css).toContain(".v4::before");
  expect(v4Css).toContain(".v4::after");
  expect(v4Css).toContain("backdrop-filter: blur(18px);");
  expect(v4Css).toContain(
    "box-shadow: inset 0 1px 0 rgb(255 255 255 / 16%)",
  );
  expect(v4Css).toContain("@media (max-width: 767px)");
  expect(modalPortalTokens).toContain("--v4-glass: rgb(14 25 43 / 72%);");
  expect(modalPortalTokens).toContain("--v4-ink: #f3f8f6;");
  expect(v4Css).not.toContain("@heroui/styles");
  expect(v4Css).not.toContain("prefers-reduced-motion");
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

  expect(tabListContainer).toContain("overflow-x: auto;");
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
  expect(v4Css).toContain("--v4-accent: #59d6a0");
  expect(v4Css).toContain(
    "grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr)",
  );
  expect(v4Css).not.toContain("--v3-lavender");
  expect(v4Css).not.toContain("prefers-reduced-motion");
  expect(v4Css).not.toContain("v3-product-band");
});
