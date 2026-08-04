import {
  captureMaxBytes,
  captureRetentionMs,
  captureUploadUrlTtlSeconds,
} from "@biume/contracts/capture";
import type { AudioCapture } from "@biume/db/schema/index";
import { describe, expect, it, vi } from "vitest";
import type { AudioObjectStore } from "./audio-object-store";
import {
  CaptureServiceError,
  cancelCapture,
  completeCapture,
  createCapture,
  createUploadSession,
  type CaptureActor,
  type CaptureRepository,
} from "./capture.service";

const actor: CaptureActor = {
  practitionerId: "user-1",
  organizationId: "org-1",
};

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";
const sha256 = "a".repeat(64);
const now = new Date("2026-07-19T10:00:00.000Z");

const freeCaptureRequest = {
  id: captureId,
  appointmentId: null,
  durationMs: 120_000,
  mimeType: "audio/mp4" as const,
  byteSize: 1_048_576,
  sha256,
  createdAt: "2026-07-19T09:59:00.000Z",
};

function buildRow(overrides: Partial<AudioCapture> = {}): AudioCapture {
  return {
    id: captureId,
    organizationId: "org-1",
    practitionerId: "user-1",
    appointmentId: null,
    patientId: null,
    reportId: null,
    durationMs: 120_000,
    mimeType: "audio/mp4",
    byteSize: 1_048_576,
    sha256,
    objectKey: `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
    objectEtag: null,
    status: "pending_upload",
    attemptCount: 0,
    lastErrorCode: null,
    createdAt: now,
    uploadedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs),
    purgedAt: null,
    updatedAt: now,
    ...overrides,
  };
}

function createRepository(seed: AudioCapture[] = []) {
  const rows = new Map(seed.map((row) => [row.id, row]));

  const repository: CaptureRepository = {
    findCapture: vi.fn(async ({ id, organizationId }) => {
      const row = rows.get(id);
      return row && row.organizationId === organizationId ? row : null;
    }),
    insertCapture: vi.fn(async (row) => {
      if (rows.has(row.id)) return null;
      const inserted = buildRow(row);
      rows.set(row.id, inserted);
      return inserted;
    }),
    findAppointmentContext: vi.fn(async () => null),
    transitionCapture: vi.fn<CaptureRepository["transitionCapture"]>(
      async ({ id, organizationId, from, to, patch }) => {
        const row = rows.get(id);
        if (!row || row.organizationId !== organizationId) return null;
        if (!from.some((status) => status === row.status)) return null;
        const next = { ...row, ...patch, status: to };
        rows.set(id, next);
        return next;
      },
    ),
  };

  return { repository, rows };
}

function createObjectStore(overrides: Partial<AudioObjectStore> = {}) {
  return {
    createPutUrl: vi.fn(async () => ({
      url: "https://storage.example.com/signed",
      headers: { "content-type": "audio/mp4" },
      expiresAt: new Date(now.getTime() + captureUploadUrlTtlSeconds * 1000),
    })),
    head: vi.fn(async () => ({
      etag: '"etag-1"',
      contentType: "audio/mp4",
      byteSize: 1_048_576,
      metadata: { sha256 },
    })),
    delete: vi.fn(async () => {}),
    ...overrides,
  } satisfies AudioObjectStore;
}

function createDependencies(
  overrides: {
    repository?: CaptureRepository;
    objectStore?: AudioObjectStore;
  } = {},
) {
  return {
    repository: overrides.repository ?? createRepository().repository,
    objectStore: overrides.objectStore ?? createObjectStore(),
    now: () => now,
    // Opaque on purpose: the fake must not embed the organization id, or the
    // "never leaks the organization id" assertion would prove nothing.
    hashOrganizationId: (organizationId: string) =>
      organizationId === "org-1" ? "9f86d081884c7d65" : "0000000000000000",
  };
}

describe("capture creation", () => {
  it("returns the existing capture when the mobile retries the same recording", async () => {
    const existing = buildRow();
    const { repository } = createRepository([existing]);
    const dependencies = createDependencies({ repository });

    const result = await createCapture(actor, freeCaptureRequest, dependencies);

    expect(result.id).toBe(captureId);
    expect(repository.insertCapture).not.toHaveBeenCalled();
  });

  it("refuses a known identifier carrying different audio", async () => {
    const existing = buildRow();
    const { repository } = createRepository([existing]);
    const dependencies = createDependencies({ repository });

    await expect(
      createCapture(
        actor,
        { ...freeCaptureRequest, sha256: "b".repeat(64) },
        dependencies,
      ),
    ).rejects.toMatchObject({
      code: "conflict",
      reason: "capture_identity_conflict",
    });
  });

  it("resolves patient and report only from the tenant's own appointment", async () => {
    const { repository } = createRepository();
    repository.findAppointmentContext = vi.fn(async () => ({
      patientId: "pet-1",
      reportId: "report-1",
    }));
    const dependencies = createDependencies({ repository });

    const result = await createCapture(
      actor,
      { ...freeCaptureRequest, appointmentId: "appointment-1" },
      dependencies,
    );

    expect(repository.findAppointmentContext).toHaveBeenCalledWith({
      appointmentId: "appointment-1",
      organizationId: "org-1",
    });
    expect(result.patientId).toBe("pet-1");
    expect(result.reportId).toBe("report-1");
  });

  it("refuses an appointment that does not belong to the session organization", async () => {
    const { repository } = createRepository();
    const dependencies = createDependencies({ repository });

    await expect(
      createCapture(
        actor,
        { ...freeCaptureRequest, appointmentId: "other-org-appointment" },
        dependencies,
      ),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("accepts a free capture with no appointment context", async () => {
    const dependencies = createDependencies();

    const result = await createCapture(actor, freeCaptureRequest, dependencies);

    expect(result.appointmentId).toBeNull();
    expect(result.patientId).toBeNull();
    expect(result.reportId).toBeNull();
  });

  it("derives an opaque object key that never leaks the organization id", async () => {
    const dependencies = createDependencies();

    const result = await createCapture(actor, freeCaptureRequest, dependencies);

    expect(result.objectKey).toBe(
      `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
    );
    expect(result.objectKey).not.toContain("org-1/");
  });

  it("owns retention on the server clock", async () => {
    const dependencies = createDependencies();

    const result = await createCapture(actor, freeCaptureRequest, dependencies);

    expect(result.expiresAt).toBe(
      new Date(now.getTime() + captureRetentionMs).toISOString(),
    );
  });

  it("rereads the canonical row when two devices insert the same identifier", async () => {
    const { repository } = createRepository();
    const concurrent = buildRow();
    repository.insertCapture = vi.fn(async () => null);
    repository.findCapture = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrent);
    const dependencies = createDependencies({ repository });

    const result = await createCapture(actor, freeCaptureRequest, dependencies);

    expect(result.id).toBe(captureId);
  });
});

describe("upload session", () => {
  it("signs a PUT bound to the capture's own object", async () => {
    const { repository } = createRepository([buildRow()]);
    const objectStore = createObjectStore();
    const dependencies = createDependencies({ repository, objectStore });

    const session = await createUploadSession(actor, captureId, dependencies);

    expect(objectStore.createPutUrl).toHaveBeenCalledWith({
      key: `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
      contentType: "audio/mp4",
      byteSize: 1_048_576,
      sha256,
      expiresInSeconds: captureUploadUrlTtlSeconds,
    });
    expect(session.method).toBe("PUT");
  });

  it("renews a session without changing the capture or its object key", async () => {
    const { repository, rows } = createRepository([
      buildRow({ status: "uploading", attemptCount: 1 }),
    ]);
    const dependencies = createDependencies({ repository });

    await createUploadSession(actor, captureId, dependencies);

    const row = rows.get(captureId);
    expect(row?.objectKey).toBe(`captures/9f86d081884c7d65/${captureId}/audio.m4a`);
    expect(row?.status).toBe("uploading");
    expect(repository.insertCapture).not.toHaveBeenCalled();
  });

  it("resumes a capture that previously failed", async () => {
    const { repository, rows } = createRepository([
      buildRow({ status: "retryable_failure", lastErrorCode: "network" }),
    ]);
    const dependencies = createDependencies({ repository });

    await createUploadSession(actor, captureId, dependencies);

    expect(rows.get(captureId)?.status).toBe("uploading");
  });

  it("refuses to issue a session for a cancelled capture", async () => {
    const { repository } = createRepository([
      buildRow({ status: "cancelled" }),
    ]);
    const dependencies = createDependencies({ repository });

    await expect(
      createUploadSession(actor, captureId, dependencies),
    ).rejects.toMatchObject({ code: "conflict" });
  });

  it("refuses a capture belonging to another organization", async () => {
    const { repository } = createRepository([
      buildRow({ organizationId: "org-2" }),
    ]);
    const dependencies = createDependencies({ repository });

    await expect(
      createUploadSession(actor, captureId, dependencies),
    ).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("capture completion", () => {
  it("confirms the object against every expected attribute", async () => {
    const { repository, rows } = createRepository([
      buildRow({ status: "uploading" }),
    ]);
    const objectStore = createObjectStore();
    const dependencies = createDependencies({ repository, objectStore });

    const result = await completeCapture(
      actor,
      captureId,
      { etag: '"etag-1"' },
      dependencies,
    );

    expect(objectStore.head).toHaveBeenCalledWith(
      `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
    );
    expect(result.status).toBe("uploaded");
    expect(rows.get(captureId)?.objectEtag).toBe('"etag-1"');
  });

  it("keeps a missing object recoverable instead of confirming it", async () => {
    const { repository, rows } = createRepository([
      buildRow({ status: "uploading" }),
    ]);
    const objectStore = createObjectStore({ head: vi.fn(async () => null) });
    const dependencies = createDependencies({ repository, objectStore });

    await expect(
      completeCapture(actor, captureId, { etag: '"etag-1"' }, dependencies),
    ).rejects.toMatchObject({ code: "object_incomplete", retryable: true });
    expect(rows.get(captureId)?.status).toBe("retryable_failure");
  });

  it.each([
    ["a mismatched etag", { etag: '"other"' }],
    ["a mismatched content type", { contentType: "audio/mpeg" }],
    ["a mismatched byte size", { byteSize: 999 }],
    ["a mismatched fingerprint", { metadata: { sha256: "b".repeat(64) } }],
  ])("never confirms an object with %s", async (_label, patch) => {
    const { repository, rows } = createRepository([
      buildRow({ status: "uploading" }),
    ]);
    const objectStore = createObjectStore({
      head: vi.fn(async () => ({
        etag: '"etag-1"',
        contentType: "audio/mp4",
        byteSize: 1_048_576,
        metadata: { sha256 },
        ...patch,
      })),
    });
    const dependencies = createDependencies({ repository, objectStore });

    await expect(
      completeCapture(actor, captureId, { etag: '"etag-1"' }, dependencies),
    ).rejects.toMatchObject({ code: "object_incomplete" });
    expect(rows.get(captureId)?.status).not.toBe("uploaded");
  });

  it.each(["cancelled", "expired"] as const)(
    "refuses to complete a %s capture",
    async (status) => {
      const { repository, rows } = createRepository([buildRow({ status })]);
      const dependencies = createDependencies({ repository });

      await expect(
        completeCapture(actor, captureId, { etag: '"etag-1"' }, dependencies),
      ).rejects.toMatchObject({ code: "conflict" });
      expect(rows.get(captureId)?.status).toBe(status);
    },
  );

  it("confirms an already uploaded capture without a second write", async () => {
    const uploaded = buildRow({
      status: "uploaded",
      objectEtag: '"etag-1"',
      uploadedAt: now,
    });
    const { repository } = createRepository([uploaded]);
    const dependencies = createDependencies({ repository });

    const result = await completeCapture(
      actor,
      captureId,
      { etag: '"etag-1"' },
      dependencies,
    );

    expect(result.status).toBe("uploaded");
    expect(repository.transitionCapture).not.toHaveBeenCalled();
  });
});

describe("capture cancellation", () => {
  it("cancels the capture and purges its object", async () => {
    const { repository, rows } = createRepository([buildRow()]);
    const objectStore = createObjectStore();
    const dependencies = createDependencies({ repository, objectStore });

    await cancelCapture(actor, captureId, dependencies);

    expect(rows.get(captureId)?.status).toBe("cancelled");
    expect(objectStore.delete).toHaveBeenCalledWith(
      `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
    );
  });

  it("stays idempotent when the capture is already cancelled", async () => {
    const { repository, rows } = createRepository([
      buildRow({ status: "cancelled" }),
    ]);
    const objectStore = createObjectStore();
    const dependencies = createDependencies({ repository, objectStore });

    await expect(
      cancelCapture(actor, captureId, dependencies),
    ).resolves.toBeUndefined();
    expect(rows.get(captureId)?.status).toBe("cancelled");
    expect(objectStore.delete).toHaveBeenCalledTimes(1);
  });

  it("refuses to cancel across tenants", async () => {
    const { repository, rows } = createRepository([
      buildRow({ organizationId: "org-2" }),
    ]);
    const objectStore = createObjectStore();
    const dependencies = createDependencies({ repository, objectStore });

    await expect(
      cancelCapture(actor, captureId, dependencies),
    ).rejects.toMatchObject({ code: "not_found" });
    expect(rows.get(captureId)?.status).toBe("pending_upload");
    expect(objectStore.delete).not.toHaveBeenCalled();
  });
});

describe("capture service errors", () => {
  it("never carries a raw storage or database message across the boundary", async () => {
    const { repository } = createRepository([buildRow()]);
    const dependencies = createDependencies({ repository });

    const error = await createCapture(
      actor,
      { ...freeCaptureRequest, byteSize: captureMaxBytes },
      dependencies,
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CaptureServiceError);
    expect((error as CaptureServiceError).code).toBe("conflict");
  });
});
