import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("reports editor responsive workspace", () => {
  test("reuses the complete workspace header in the mobile layout", async () => {
    const source = await readFile(
      `${import.meta.dirname}/reports-editor.tsx`,
      "utf8",
    );
    const mobileLayout = source.split("{/* Mobile/Tablet Layout */}")[1] ?? "";

    expect(source.match(/<ReportWorkspaceHeader/g)).toHaveLength(2);
    expect(mobileLayout).toContain("<ReportWorkspaceHeader");
    expect(mobileLayout).not.toContain('aria-label="Sauvegarder"');
    expect(mobileLayout).not.toContain('aria-label="Aperçu"');
  });
});
