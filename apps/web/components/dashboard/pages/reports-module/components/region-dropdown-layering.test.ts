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
    "%s uses an input-compatible non-modal popover inside the parent modal",
    (fileName) => {
      const source = readComponentSource(fileName);

      expect(source).toMatch(
        /<Popover\s+modal=\{false\}\s+open=\{openRegionPopover\}\s+onOpenChange=\{setOpenRegionPopover\}/,
      );
      expect(source).not.toContain("<DropdownMenu");
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
      openExpression: "isOpen && !!animalType",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsInterventionZoneSelectOpen",
    },
    {
      fileName: "AddObservationsDialog.tsx",
      openExpression: "isOpen && !!animalType",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsInterventionZoneSelectOpen",
    },
    {
      fileName: "InitializationDialog.tsx",
      openExpression: "showInitDialog",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsPetSelectOpen",
    },
    {
      fileName: "InitializationDialog.tsx",
      openExpression: "showInitDialog",
      dismissalGuard: "isSelectOpen",
      openHandler: "setIsAppointmentSelectOpen",
    },
  ])(
    "$fileName keeps the parent modal open while an inner select is closing",
    ({ fileName, openExpression, dismissalGuard, openHandler }) => {
      const source = readComponentSource(fileName);
      const openChangeProp =
        fileName === "InitializationDialog.tsx"
          ? "setShowInitDialog"
          : "onOpenChange";

      expect(source).toMatch(
        new RegExp(
          `<Credenza[\\s\\S]*open=\\{${openExpression}\\}[\\s\\S]*onOpenChange=\\{${openChangeProp}\\}[\\s\\S]*disablePointerDismissal=\\{${dismissalGuard}\\}`,
        ),
      );
      expect(source).toContain(`onOpenChange={${openHandler}}`);
    },
  );
});
