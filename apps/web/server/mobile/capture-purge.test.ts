import { describe, expect, it, vi } from "vitest";
import type { AudioObjectStore } from "./audio-object-store";
import {
  capturePurgeBatchSize,
  purgeExpiredCaptures,
  type CapturePurgePorts,
  type PurgeableCapture,
} from "./capture-purge";

const now = new Date("2026-07-20T12:00:00.000Z");

function buildPurgeable(
  overrides: Partial<PurgeableCapture> = {},
): PurgeableCapture {
  return {
    id: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70",
    organizationId: "org-1",
    objectKey: "captures/hash/capture-1/audio.m4a",
    ...overrides,
  };
}

function createObjectStore(
  overrides: Partial<AudioObjectStore> = {},
): AudioObjectStore {
  return {
    createPutUrl: vi.fn(),
    head: vi.fn(),
    delete: vi.fn(async () => {}),
    ...overrides,
  } as AudioObjectStore;
}

function createPorts(
  expired: PurgeableCapture[],
  overrides: Partial<CapturePurgePorts> = {},
): CapturePurgePorts {
  return {
    findExpired: vi.fn(async () => expired),
    markExpired: vi.fn(async () => {}),
    markPurged: vi.fn(async () => {}),
    objectStore: createObjectStore(),
    now: () => now,
    ...overrides,
  };
}

describe("selection", () => {
  it("asks only for captures past their window and not already purged", async () => {
    const ports = createPorts([]);

    await purgeExpiredCaptures(ports, { limit: capturePurgeBatchSize });

    expect(ports.findExpired).toHaveBeenCalledWith({
      now,
      limit: capturePurgeBatchSize,
    });
  });

  it("does nothing when nothing has expired", async () => {
    const ports = createPorts([]);

    const result = await purgeExpiredCaptures(ports, { limit: 100 });

    expect(result).toEqual({ purged: 0, failed: 0 });
    expect(ports.objectStore.delete).not.toHaveBeenCalled();
  });

  it("never asks for more than the bounded batch", async () => {
    const ports = createPorts([]);

    await purgeExpiredCaptures(ports, { limit: 5_000 });

    expect(ports.findExpired).toHaveBeenCalledWith({
      now,
      limit: capturePurgeBatchSize,
    });
  });
});

describe("purge order", () => {
  it("marks the rows expired before touching any object", async () => {
    const order: string[] = [];
    const capture = buildPurgeable();
    const ports = createPorts([capture], {
      markExpired: vi.fn(async () => {
        order.push("mark-expired");
      }),
      objectStore: createObjectStore({
        delete: vi.fn(async () => {
          order.push("delete-object");
        }),
      }),
      markPurged: vi.fn(async () => {
        order.push("mark-purged");
      }),
    });

    await purgeExpiredCaptures(ports, { limit: 100 });

    expect(order).toEqual(["mark-expired", "delete-object", "mark-purged"]);
  });

  it("deletes exactly the key the capture owns", async () => {
    const capture = buildPurgeable();
    const ports = createPorts([capture]);

    await purgeExpiredCaptures(ports, { limit: 100 });

    expect(ports.objectStore.delete).toHaveBeenCalledWith(capture.objectKey);
    expect(ports.objectStore.delete).toHaveBeenCalledTimes(1);
  });

  it("records the purge against the capture and its tenant", async () => {
    const capture = buildPurgeable();
    const ports = createPorts([capture]);

    await purgeExpiredCaptures(ports, { limit: 100 });

    expect(ports.markPurged).toHaveBeenCalledWith(
      { id: capture.id, organizationId: capture.organizationId },
      now,
    );
  });

  it("tolerates an object that is already gone", async () => {
    const ports = createPorts([buildPurgeable()], {
      objectStore: createObjectStore({ delete: vi.fn(async () => {}) }),
    });

    expect(await purgeExpiredCaptures(ports, { limit: 100 })).toEqual({
      purged: 1,
      failed: 0,
    });
  });
});

describe("failures", () => {
  it("keeps the key when the object store refuses the deletion", async () => {
    const ports = createPorts([buildPurgeable()], {
      objectStore: createObjectStore({
        delete: vi.fn(async () => {
          throw new Error("storage unavailable");
        }),
      }),
    });

    const result = await purgeExpiredCaptures(ports, { limit: 100 });

    expect(result).toEqual({ purged: 0, failed: 1 });
    // Without `purgedAt` the row stays selectable, so the next run retries the
    // same key instead of losing it.
    expect(ports.markPurged).not.toHaveBeenCalled();
  });

  it("keeps purging the rest of the batch after one failure", async () => {
    const failing = buildPurgeable({ id: "failing", objectKey: "key-failing" });
    const healthy = buildPurgeable({ id: "healthy", objectKey: "key-healthy" });
    const ports = createPorts([failing, healthy], {
      objectStore: createObjectStore({
        delete: vi.fn(async (key: string) => {
          if (key === "key-failing") throw new Error("storage unavailable");
        }),
      }),
    });

    const result = await purgeExpiredCaptures(ports, { limit: 100 });

    expect(result).toEqual({ purged: 1, failed: 1 });
    expect(ports.markPurged).toHaveBeenCalledTimes(1);
  });

  it("never carries a storage message out of the purge", async () => {
    const ports = createPorts([buildPurgeable()], {
      objectStore: createObjectStore({
        delete: vi.fn(async () => {
          throw new Error("AccessDenied at 10.0.0.4");
        }),
      }),
    });

    await expect(
      purgeExpiredCaptures(ports, { limit: 100 }),
    ).resolves.toEqual({ purged: 0, failed: 1 });
  });
});

describe("tenancy", () => {
  it("keeps each capture bound to its own organization", async () => {
    const first = buildPurgeable({ id: "a", organizationId: "org-1" });
    const second = buildPurgeable({ id: "b", organizationId: "org-2" });
    const ports = createPorts([first, second]);

    await purgeExpiredCaptures(ports, { limit: 100 });

    expect(ports.markPurged).toHaveBeenCalledWith(
      { id: "a", organizationId: "org-1" },
      now,
    );
    expect(ports.markPurged).toHaveBeenCalledWith(
      { id: "b", organizationId: "org-2" },
      now,
    );
  });
});
