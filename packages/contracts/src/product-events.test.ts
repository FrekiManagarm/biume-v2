import { describe, expect, it } from "vitest";
import { productEventSchema } from "./product-events";

describe("product event contracts", () => {
  it("accepts a report creation event without personal data", () => {
    expect(
      productEventSchema.parse({
        name: "report_created",
        properties: {
          reportId: "report-1",
          source: "web_quick_create",
        },
      }),
    ).toEqual({
      name: "report_created",
      properties: {
        reportId: "report-1",
        source: "web_quick_create",
      },
    });
  });

  it("rejects unknown event names", () => {
    expect(
      productEventSchema.safeParse({
        name: "owner_name_captured",
        properties: {},
      }).success,
    ).toBe(false);
  });

  it("rejects personal or clinical free-text properties", () => {
    expect(
      productEventSchema.safeParse({
        name: "report_created",
        properties: {
          reportId: "report-1",
          source: "web_quick_create",
          ownerEmail: "camille@example.com",
        },
      }).success,
    ).toBe(false);
  });
});
