import { describe, expect, test, vi } from "vitest";

import {
  deleteRecordWithUploadThingFiles,
  deleteUploadThingFiles,
  getUploadThingFileKey,
} from "./uploadthing-files";

describe("getUploadThingFileKey", () => {
  test.each([
    ["https://utfs.io/f/file-key.pdf", "file-key.pdf"],
    ["https://uploadthing.com/f/legacy-key", "legacy-key"],
    ["https://abc123.ufs.sh/f/current-key?token=signed", "current-key"],
    ["https://ufs.sh/a/abc123/path-style-key", "path-style-key"],
  ])("extracts an UploadThing key from %s", (url, expectedKey) => {
    expect(getUploadThingFileKey(url)).toBe(expectedKey);
  });

  test.each([
    "https://example.com/f/not-ours",
    "https://abc123.ufs.sh/not-a-file/key",
    "not a url",
  ])("does not derive a key from an unrelated URL: %s", (url) => {
    expect(getUploadThingFileKey(url)).toBeNull();
  });
});

describe("deleteUploadThingFiles", () => {
  test("deduplicates keys and deletes them through UploadThing", async () => {
    const deleteFiles = vi.fn(async () => ({
      success: true,
      deletedCount: 2,
    }));

    await deleteUploadThingFiles(
      [
        "https://utfs.io/f/key-a",
        "https://abc.ufs.sh/f/key-b",
        "https://utfs.io/f/key-a",
        "https://example.com/external.pdf",
      ],
      deleteFiles,
    );

    expect(deleteFiles).toHaveBeenCalledWith(["key-a", "key-b"]);
  });

  test("rejects a negative UploadThing response", async () => {
    const deleteFiles = vi.fn(async () => ({
      success: false,
      deletedCount: 0,
    }));

    await expect(
      deleteUploadThingFiles(["https://utfs.io/f/key-a"], deleteFiles),
    ).rejects.toThrow("UploadThing");
  });
});

describe("deleteRecordWithUploadThingFiles", () => {
  test("deletes remote files before deleting the database record", async () => {
    const calls: string[] = [];
    const deleteFiles = vi.fn(async () => {
      calls.push("files");
      return { success: true, deletedCount: 1 };
    });
    const deleteRecord = vi.fn(async () => {
      calls.push("record");
      return { id: "patient-1" };
    });

    const result = await deleteRecordWithUploadThingFiles({
      deleteFiles,
      deleteRecord,
      fileUrls: ["https://utfs.io/f/key-a"],
    });

    expect(calls).toEqual(["files", "record"]);
    expect(result).toEqual({ id: "patient-1" });
  });

  test("keeps database references when remote cleanup fails", async () => {
    const deleteFiles = vi.fn(async () => {
      throw new Error("UploadThing unavailable");
    });
    const deleteRecord = vi.fn(async () => ({ id: "patient-1" }));

    await expect(
      deleteRecordWithUploadThingFiles({
        deleteFiles,
        deleteRecord,
        fileUrls: ["https://utfs.io/f/key-a"],
      }),
    ).rejects.toThrow("UploadThing unavailable");
    expect(deleteRecord).not.toHaveBeenCalled();
  });
});
