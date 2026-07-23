import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "bun:test";

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
  expect(existsSync(v4CssPath)).toBeFalse();
  expect(sourceFilesReferencingHeroUIStyles).toEqual([]);
});
