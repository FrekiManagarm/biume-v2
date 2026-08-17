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

describe("mobile capture telemetry", () => {
  it("accepts the technical shape of a mobile capture upload", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: {
          captureId: "capture-1",
          source: "mobile_appointment",
          journeyType: "appointment",
          platform: "ios",
          appVersion: "0.1.0",
          byteSize: 1_048_576,
          durationMs: 120_000,
          online: true,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts a free capture queued offline with a normalized error", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_queued_offline",
        properties: {
          captureId: "capture-2",
          source: "mobile_free_capture",
          journeyType: "free_capture",
          platform: "android",
          appVersion: "0.1.0",
          errorCategory: "network",
        },
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown platform", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: { captureId: "capture-1", platform: "windows" },
      }).success,
    ).toBe(false);
  });

  it("rejects the patient name", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: { captureId: "capture-1", patientName: "Nala" },
      }).success,
    ).toBe(false);
  });

  it("rejects the appointment note", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: {
          captureId: "capture-1",
          appointmentNote: "Boiterie posterieure gauche",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects a signed upload URL", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: {
          captureId: "capture-1",
          signedUrl: "https://storage.example.com/x?signature=y",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects free text smuggled as a message", () => {
    expect(
      productEventSchema.safeParse({
        name: "capture_uploaded",
        properties: { captureId: "capture-1", message: "anything at all" },
      }).success,
    ).toBe(false);
  });
});
