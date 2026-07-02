import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";

const currentDir = dirname(fileURLToPath(import.meta.url));

function readComponentSource(fileName: string) {
  return readFileSync(join(currentDir, fileName), "utf8");
}

describe("region dropdown layering", () => {
  test.each(["AddAnatomicalIssueDialog.tsx", "AddObservationsDialog.tsx"])(
    "%s uses a non-modal region dropdown inside the parent modal",
    (fileName) => {
      const source = readComponentSource(fileName);

      expect(source).toMatch(
        /<DropdownMenu\s+modal=\{false\}\s+open=\{openRegionPopover\}\s+onOpenChange=\{setOpenRegionPopover\}/,
      );
    },
  );
});
