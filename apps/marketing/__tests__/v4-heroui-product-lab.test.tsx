import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "bun:test";

const marketingRoot = join(import.meta.dir, "..");

test("V4 Product Lab has the HeroUI foundation", () => {
  const packageJson = JSON.parse(
    readFileSync(join(marketingRoot, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string> };
  const globalsCss = readFileSync(join(marketingRoot, "app/globals.css"), "utf8");

  expect(packageJson.dependencies?.["@heroui/react"]).toBeDefined();
  expect(packageJson.dependencies?.["@heroui/styles"]).toBeDefined();
  expect(globalsCss).toContain('@import "@heroui/styles";');
});
