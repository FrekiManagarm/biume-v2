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
  expect(v4Css).toContain("--v4-surface: #ffffff;");
  expect(v4Css).toContain("--v4-accent-soft: #e5f4ed;");
  expect(sourceFilesReferencingHeroUIStyles).toEqual([]);
});

const { default: V4Page, metadata } = await import("../app/v4/page");
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

  await act(async () => {
    fireEvent.keyDown(dialog, { code: "Escape", key: "Escape" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(within(document.body).queryByRole("dialog")).toBeNull();
});
