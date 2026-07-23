import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "bun:test";

const marketingRoot = join(import.meta.dir, "..");

test("V4 Product Lab has the HeroUI foundation", () => {
  const packageJson = JSON.parse(
    readFileSync(join(marketingRoot, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string> };
  const globalsCss = readFileSync(join(marketingRoot, "app/globals.css"), "utf8");
  const v4CssPath = join(marketingRoot, "app/v4/v4.css");
  const v4Css = existsSync(v4CssPath) ? readFileSync(v4CssPath, "utf8") : "";

  expect(packageJson.dependencies?.["@heroui/react"]).toBe("^3.2.2");
  expect(packageJson.dependencies?.["@heroui/styles"]).toBeUndefined();
  expect(globalsCss).not.toContain('@import "@heroui/styles";');
  expect(v4Css).not.toContain('@import "@heroui/styles";');
  expect(existsSync(v4CssPath)).toBeFalse();
});
