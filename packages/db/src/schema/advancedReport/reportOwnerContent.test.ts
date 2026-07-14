import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";
import { reportOwnerContent } from "./reportOwnerContent";

describe("reportOwnerContent", () => {
  test("has the required columns and unique source key", () => {
    const config = getTableConfig(reportOwnerContent);
    expect(config.name).toBe("report_owner_content");
    expect(config.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        "id",
        "report_id",
        "source_kind",
        "source_id",
        "owner_text",
        "source_fingerprint",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes.some((index) => index.config.unique)).toBe(true);
  });
});
