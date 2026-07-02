import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const currentDir = dirname(fileURLToPath(import.meta.url));
const routeTreePath = join(currentDir, "../routeTree.gen.ts");

describe("report editor route", () => {
  test("renders outside the dashboard layout while keeping the dashboard URL", () => {
    const routeTree = readFileSync(routeTreePath, "utf8");

    expect(routeTree).toContain("id: '/dashboard_/reports_/$id_/edit'");
    expect(routeTree).toContain("path: '/dashboard/reports/$id/edit'");
    expect(routeTree).toContain("getParentRoute: () => rootRouteImport");
  });
});
