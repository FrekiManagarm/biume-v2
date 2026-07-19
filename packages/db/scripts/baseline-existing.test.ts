import { describe, expect, it } from "vitest";
import { validateMigrationJournal } from "./baseline-existing";

describe("validateMigrationJournal", () => {
  it("accepts baseline, owner content, and later generated migrations", () => {
    expect(
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 1, tag: "0000_baseline" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
          { idx: 2, when: 3, tag: "0002_report_domain_foundation" },
        ],
      }).map((entry) => entry.tag),
    ).toEqual([
      "0000_baseline",
      "0001_report_owner_content",
      "0002_report_domain_foundation",
    ]);
  });

  it("rejects a changed baseline prefix", () => {
    expect(() =>
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 1, tag: "0000_other" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
        ],
      }),
    ).toThrow("Expected migration history to start with");
  });

  it("rejects non-increasing timestamps", () => {
    expect(() =>
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 2, tag: "0000_baseline" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
        ],
      }),
    ).toThrow("timestamps are missing or out of order");
  });
});
