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

  test.each(["AddAnatomicalIssueDialog.tsx", "AddObservationsDialog.tsx"])(
    "%s waits for an intervention zone before loading anatomical regions",
    (fileName) => {
      const source = readComponentSource(fileName);

      expect(source).not.toContain('selectedZone || "articulation"');
      expect(source).toMatch(/enabled:[\s\S]*!!selectedZone/);
      expect(source).toMatch(/disabled=\{!selectedZone\}/);
    },
  );

  test.each([
    {
      fileName: "AddAnatomicalIssueDialog.tsx",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsInterventionZoneSelectOpen",
    },
    {
      fileName: "AddObservationsDialog.tsx",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsInterventionZoneSelectOpen",
    },
    {
      fileName: "InitializationDialog.tsx",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsPetSelectOpen",
    },
    {
      fileName: "InitializationDialog.tsx",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsAppointmentSelectOpen",
    },
  ])(
    "$fileName keeps the parent modal open while an inner select is closing",
    ({ fileName, dismissalGuard, openHandler }) => {
      const source = readComponentSource(fileName);
      const openProp =
        fileName === "InitializationDialog.tsx" ? "showInitDialog" : "isOpen";
      const openChangeProp =
        fileName === "InitializationDialog.tsx"
          ? "setShowInitDialog"
          : "onOpenChange";

      expect(source).toMatch(
        new RegExp(
          `<Credenza[\\s\\S]*open=\\{${openProp}\\}[\\s\\S]*onOpenChange=\\{${openChangeProp}\\}[\\s\\S]*disablePointerDismissal=\\{${dismissalGuard}\\}`,
        ),
      );
      expect(source).toContain(`onOpenChange={${openHandler}}`);
    },
  );
});
