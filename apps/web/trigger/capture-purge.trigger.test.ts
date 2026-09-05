import { describe, expect, it, vi } from "vitest";
import {
  capturePurgeMaxBatches,
  capturePurgeTaskId,
  runCapturePurgeBatches,
} from "./capture-purge.trigger";

describe("purge orchestration", () => {
  it("uses a stable task identifier", () => {
    expect(capturePurgeTaskId).toBe("mobile-capture-purge");
  });

  it("stops as soon as a batch finds nothing", async () => {
    const runBatch = vi.fn(async () => ({ purged: 0, failed: 0 }));

    expect(await runCapturePurgeBatches(runBatch)).toEqual({
      batches: 1,
      purged: 0,
      failed: 0,
    });
  });

  it("keeps going while batches keep finding captures", async () => {
    const runBatch = vi
      .fn()
      .mockResolvedValueOnce({ purged: 100, failed: 0 })
      .mockResolvedValueOnce({ purged: 40, failed: 0 })
      .mockResolvedValue({ purged: 0, failed: 0 });

    expect(await runCapturePurgeBatches(runBatch)).toEqual({
      batches: 3,
      purged: 140,
      failed: 0,
    });
  });

  it("gives up before running forever", async () => {
    const runBatch = vi.fn(async () => ({ purged: 100, failed: 0 }));

    const result = await runCapturePurgeBatches(runBatch);

    expect(result.batches).toBe(capturePurgeMaxBatches);
    expect(runBatch).toHaveBeenCalledTimes(capturePurgeMaxBatches);
  });

  it("stops when a batch only produces failures", async () => {
    const runBatch = vi.fn(async () => ({ purged: 0, failed: 5 }));

    const result = await runCapturePurgeBatches(runBatch);

    // Retrying the same failing keys in a tight loop would only hammer the
    // object store; the next scheduled run picks them up.
    expect(result).toEqual({ batches: 1, purged: 0, failed: 5 });
  });

  it("counts failures across batches", async () => {
    const runBatch = vi
      .fn()
      .mockResolvedValueOnce({ purged: 10, failed: 2 })
      .mockResolvedValue({ purged: 0, failed: 0 });

    expect(await runCapturePurgeBatches(runBatch)).toEqual({
      batches: 2,
      purged: 10,
      failed: 2,
    });
  });
});
