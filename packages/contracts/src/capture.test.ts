import { describe, expect, it } from "vitest";
import {
  canTransitionServerCapture,
  captureMaxBytes,
  captureMaxDurationMs,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  mobileApiErrorSchema,
  mobileAppointmentSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
} from "./capture";

const validCapture = {
  id: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70",
  appointmentId: null,
  durationMs: 120_000,
  mimeType: "audio/mp4",
  byteSize: 1_048_576,
  sha256: "a".repeat(64),
  createdAt: "2026-07-19T10:00:00.000Z",
};

describe("create capture request", () => {
  it("accepts a capture the mobile can produce offline", () => {
    expect(createCaptureRequestSchema.safeParse(validCapture).success).toBe(
      true,
    );
  });

  it("rejects a recording longer than the ten minute limit", () => {
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        durationMs: captureMaxDurationMs + 1,
      }).success,
    ).toBe(false);
  });

  it("rejects a payload larger than the accepted object size", () => {
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        byteSize: captureMaxBytes + 1,
      }).success,
    ).toBe(false);
  });

  it("rejects a client supplied organization identifier", () => {
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        organizationId: "attacker-org",
      }).success,
    ).toBe(false);
  });

  it("rejects an identifier that is not a UUID", () => {
    expect(
      createCaptureRequestSchema.safeParse({ ...validCapture, id: "capture-1" })
        .success,
    ).toBe(false);
  });

  it("rejects any container other than the canonical M4A type", () => {
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        mimeType: "audio/mpeg",
      }).success,
    ).toBe(false);
  });

  it("rejects a fingerprint that is not 64 lowercase hex characters", () => {
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        sha256: "A".repeat(64),
      }).success,
    ).toBe(false);
    expect(
      createCaptureRequestSchema.safeParse({
        ...validCapture,
        sha256: "a".repeat(63),
      }).success,
    ).toBe(false);
  });
});

describe("server capture transitions", () => {
  it("moves a pending capture into the uploading state", () => {
    expect(canTransitionServerCapture("pending_upload", "uploading")).toBe(true);
  });

  it("refuses to confirm a capture that never started uploading", () => {
    expect(canTransitionServerCapture("pending_upload", "uploaded")).toBe(false);
  });

  it("confirms a capture that finished uploading", () => {
    expect(canTransitionServerCapture("uploading", "uploaded")).toBe(true);
  });

  it("retries a capture after a recoverable failure", () => {
    expect(canTransitionServerCapture("retryable_failure", "uploading")).toBe(
      true,
    );
  });

  it("refuses to revive a cancelled capture", () => {
    expect(canTransitionServerCapture("cancelled", "uploaded")).toBe(false);
  });

  it("expires an uploaded capture but allows nothing else", () => {
    expect(canTransitionServerCapture("uploaded", "expired")).toBe(true);
    expect(canTransitionServerCapture("uploaded", "uploading")).toBe(false);
  });

  it("treats expiry as terminal", () => {
    expect(canTransitionServerCapture("expired", "uploaded")).toBe(false);
  });
});

describe("upload session response", () => {
  it("describes a single signed PUT", () => {
    expect(
      uploadSessionResponseSchema.safeParse({
        method: "PUT",
        url: "https://storage.example.com/captures/abc/audio.m4a?signature=x",
        headers: { "content-type": "audio/mp4" },
        expiresAt: "2026-07-19T10:10:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("rejects any method other than PUT", () => {
    expect(
      uploadSessionResponseSchema.safeParse({
        method: "POST",
        url: "https://storage.example.com/captures/abc/audio.m4a",
        headers: { "content-type": "audio/mp4" },
        expiresAt: "2026-07-19T10:10:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("complete capture request", () => {
  it("requires the ETag returned by the object store", () => {
    expect(
      completeCaptureRequestSchema.safeParse({ etag: '"abc123"' }).success,
    ).toBe(true);
    expect(completeCaptureRequestSchema.safeParse({ etag: "" }).success).toBe(
      false,
    );
  });
});

describe("mobile session response", () => {
  it("allows a practitioner without an active organization", () => {
    expect(
      mobileSessionResponseSchema.safeParse({
        userId: "user-1",
        organization: null,
        canUploadCaptures: false,
      }).success,
    ).toBe(true);
  });
});

describe("mobile appointment", () => {
  const validAppointment = {
    id: "appointment-1",
    patientId: "patient-1",
    patientName: "Nala",
    animalType: "DOG",
    beginAt: "2026-07-19T09:00:00.000Z",
    endAt: "2026-07-19T09:45:00.000Z",
    status: "COMPLETED",
  };

  it("carries only the context the capture screen needs", () => {
    expect(mobileAppointmentSchema.safeParse(validAppointment).success).toBe(
      true,
    );
  });

  it("rejects owner contact details", () => {
    expect(
      mobileAppointmentSchema.safeParse({
        ...validAppointment,
        ownerEmail: "camille@example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects the clinical note carried by the appointment row", () => {
    expect(
      mobileAppointmentSchema.safeParse({
        ...validAppointment,
        note: "Boiterie posterieure gauche",
      }).success,
    ).toBe(false);
  });

  it.each(["DOG", "CAT", "HORSE", "RABBIT", "NAC", "COW", "OTHER"] as const)(
    "carries a %s patient, not only the species the anatomical atlas covers",
    (animalType) => {
      expect(
        mobileAppointmentSchema.safeParse({ ...validAppointment, animalType })
          .success,
      ).toBe(true);
    },
  );

  it("rejects a species the catalogue does not define", () => {
    expect(
      mobileAppointmentSchema.safeParse({
        ...validAppointment,
        animalType: "DRAGON",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown appointment status", () => {
    expect(
      mobileAppointmentSchema.safeParse({
        ...validAppointment,
        status: "ARCHIVED",
      }).success,
    ).toBe(false);
  });
});

describe("mobile api error", () => {
  it("describes a retryable failure without leaking data", () => {
    expect(
      mobileApiErrorSchema.safeParse({
        code: "network",
        message: "Connexion indisponible",
        retryable: true,
      }).success,
    ).toBe(true);
  });

  it("rejects personal data smuggled alongside the error", () => {
    expect(
      mobileApiErrorSchema.safeParse({
        code: "network",
        message: "x",
        retryable: true,
        ownerEmail: "x@y.fr",
      }).success,
    ).toBe(false);
  });

  it("names the missing active organization as its own condition", () => {
    expect(
      mobileApiErrorSchema.safeParse({
        code: "active_organization_required",
        message: "Selectionnez une organisation",
        retryable: false,
      }).success,
    ).toBe(true);
  });

  it("names an unsupported method as its own condition", () => {
    expect(
      mobileApiErrorSchema.safeParse({
        code: "method_not_allowed",
        message: "Methode non supportee",
        retryable: false,
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown error code", () => {
    expect(
      mobileApiErrorSchema.safeParse({
        code: "teapot",
        message: "x",
        retryable: false,
      }).success,
    ).toBe(false);
  });
});
